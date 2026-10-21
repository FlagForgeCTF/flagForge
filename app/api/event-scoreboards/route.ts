import { NextRequest, NextResponse } from "next/server";
import connect from "@/utils/db";
import EventScoreboard from "@/models/eventScoreboardSchema";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET - Fetch active event scoreboards (public endpoint)
export async function GET(req: NextRequest) {
  try {
    await connect();

    const { searchParams } = new URL(req.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "10", 10) || 10, 1), 100);
    const eventName = searchParams.get("eventName");

    // Build query - only show active scoreboards
    const query: any = { isActive: true };
    if (eventName) {
      // Escape regex characters to prevent ReDoS/injection
      const safeEventName = eventName.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      query.eventName = { $regex: safeEventName, $options: "i" };
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Fetch scoreboards with pagination
    const scoreboards = await EventScoreboard.find(query)
      .sort({ eventDate: -1 })
      .skip(skip)
      .limit(limit)
      .select("-uploadedBy") // Hide admin info from public API
      .lean();

    // Get total count for pagination
    const totalCount = await EventScoreboard.countDocuments(query);

    return NextResponse.json({
      success: true,
      data: scoreboards,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching event scoreboards:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch event scoreboards" },
      { status: 500 }
    );
  }
}