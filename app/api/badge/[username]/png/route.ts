import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import UserSchema from "@/models/userSchema";
import UserQuestionModel from "@/models/userQuestionSchema";

export const runtime = "nodejs";

const DEFAULT_IMAGE = "/flagforge.gif";

// Helper function to determine badge color based on score
function getBadgeColor(totalScore: number): string {
  if (totalScore >= 3000) return "#EAB308"; // Yellow for Flag Conqueror
  if (totalScore >= 2000) return "#DC2626"; // Red for Forger
  if (totalScore >= 1500) return "#EA580C"; // Orange for Cipher Hunter
  if (totalScore >= 1000) return "#7C3AED"; // Purple for Hacker
  if (totalScore >= 500) return "#059669"; // Green for Codebreaker
  if (totalScore >= 200) return "#2563EB"; // Blue for Scout
  return "#6B7280"; // Gray for Newbie
}

// Helper function to calculate user level
function getLevel(score: number): string {
  if (score < 200) return "[0x1][Newbie]";
  if (score < 500) return "[0x2][Scout]";
  if (score < 1000) return "[0x3][Codebreaker]";
  if (score < 1500) return "[0x4][Hacker]";
  if (score < 2000) return "[0x5][Cipher Hunter]";
  if (score < 3000) return "[0x6][Forger]";
  return "[0x7][Flag Conqueror]";
}

// Helper function to validate user image URL
function validateUserImage(userImage: any): string | null {
  if (
    !userImage ||
    typeof userImage !== "string" ||
    userImage.trim() === "" ||
    userImage === "undefined" ||
    userImage === "null" ||
    userImage.toLowerCase() === "null"
  ) {
    return null;
  }
  return userImage;
}

// Escape text/attribute values interpolated into the SVG markup
function escapeXml(value: string): string {
  return value.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!
  );
}

function generateBadgeSVG(userData: any, rawUserImage: string | null): string {
  const { totalScore, rank, level, completedQuestions, customBadges } =
    userData;
  const name = escapeXml(String(userData.name ?? ""));
  const userImage = rawUserImage ? escapeXml(rawUserImage) : null;
  const badgeColor = getBadgeColor(totalScore);
  const specialBadgeCount = customBadges?.length || 0;

  const avatarContent = userImage
    ? `<image x="320" y="95" width="60" height="60" href="${userImage}" clip-path="url(#avatarClip)"/>`
    : `<image x="320" y="95" width="60" height="60" href="${DEFAULT_IMAGE}" clip-path="url(#avatarClip)"/>`;

  return `<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#1F2937;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#111827;stop-opacity:1" />
      </linearGradient>
      <linearGradient id="badgeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${badgeColor};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${badgeColor}CC;stop-opacity:1" />
      </linearGradient>
      <clipPath id="avatarClip">
        <circle cx="350" cy="125" r="30"/>
      </clipPath>
    </defs>
    
    <!-- Background -->
    <rect width="400" height="200" rx="12" fill="url(#bgGradient)" stroke="#374151" stroke-width="2"/>
    
    <!-- Header -->
    <rect x="0" y="0" width="400" height="50" rx="12" fill="url(#badgeGradient)"/>
    <text x="20" y="32" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="bold" fill="white">
    flagforgectf.com
    </text>
    
    <!-- User Info -->
    <text x="20" y="80" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="bold" fill="white">
      ${name}
    </text>
    <text x="20" y="105" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" fill="${badgeColor}">
      ${level}
    </text>
    
    <!-- Stats -->
    <text x="20" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#9CA3AF">
      Rank: #${rank} • Score: ${totalScore.toLocaleString()} pts
    </text>
    <text x="20" y="155" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" fill="#9CA3AF">
      Challenges: ${completedQuestions} • Special Badges: ${specialBadgeCount}
    </text>
    
    <!-- Badge Icon - User Avatar -->
    <circle cx="350" cy="125" r="30" fill="url(#badgeGradient)" stroke="white" stroke-width="3"/>
    ${avatarContent}
    
    <!-- Footer -->
    <text x="200" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="10" fill="#6B7280" text-anchor="middle">
      Powered by flagforgectf.com
    </text>
  </svg>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    await connect();

    const { username } = await params;

    // Find user by name (case-insensitive, trimmed, partial match safe)
    const usernameWithSpaces = username.replace(/-/g, " ");

    // Exact, case-insensitive match. Escape regex characters to prevent
    // ReDoS/injection and anchor so "a" doesn't match any name containing "a".
    const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const user = await UserSchema.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${escapeRegex(username.trim())}$`, "i") } },
        { name: { $regex: new RegExp(`^${escapeRegex(usernameWithSpaces.trim())}$`, "i") } },
      ],
    }).select("name image totalScore customBadges createdAt");

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get completion stats
    const completedQuestions = await UserQuestionModel.countDocuments({
      userId: user._id,
    });

    // Calculate rank
    const allUsers = await UserSchema.find({})
      .sort({ totalScore: -1 })
      .select("_id");
    const userRank =
      allUsers.findIndex((u) => u._id.toString() === user._id.toString()) + 1;

    // Validate and set user image
    const userImage = validateUserImage(user.image);

    const userData = {
      name: user.name,
      totalScore: user.totalScore || 0,
      rank: userRank,
      level: getLevel(user.totalScore || 0),
      completedQuestions,
      customBadges: user.customBadges || [],
    };

    const svg = generateBadgeSVG(userData, userImage);

    return new NextResponse(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Badge SVG generation error:", error);
    return new NextResponse("Error generating badge", { status: 500 });
  }
}
