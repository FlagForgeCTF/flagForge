import connect from "@/utils/db";
import { NextRequest, NextResponse } from "next/server";
import QuestionModel from "@/models/qustionsSchema";
import { Questions } from "@/interfaces";
import { HttpStatusCode } from "axios";
import userSchema from "@/models/userSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import UserQuestionModel from "@/models/userQuestionSchema";
import { sendDiscordNotification } from "@/utils/discordNotifier";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import { challengeValue } from "@/lib/dynamicScoring";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    await connect();

    // Admin check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { message: "You are not authorized to add a question" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const user = await userSchema.findOne({ email: session?.user?.email });
    if (!user || user.role !== "Admin") {
      return NextResponse.json(
        { message: "You are not authorized to add a question" },
        { status: HttpStatusCode.Unauthorized }
      );
    }

    const contentType = req.headers.get("content-type");
    let questionData: any = {};
    let challengeFile: string | undefined;

    if (contentType?.includes("multipart/form-data")) {
      // Handle file upload
      const formData = await req.formData();
      
      questionData = {
        title: formData.get("title") as string,
        description: formData.get("description") as string,
        category: formData.get("category") as string,
        points: parseInt((formData.get("points") as string) || "0"),
        flag: formData.get("flag") as string,
        link: formData.get("link") as string,
        addilinks: formData.get("addilinks") as string,
        challengeType: "file",
        isTimeLimited: formData.get("isTimeLimited") === "true",
        timeLimitUnit: formData.get("timeLimitUnit") as string,
        uploadedBy: session.user.email,
      };

      const timeLimitVal = parseInt((formData.get("timeLimit") as string) || "0");
      if (timeLimitVal >= 1) {
        questionData.timeLimit = timeLimitVal;
      }

      // Handle hints
      const hintsData = formData.get("hints") as string;
      if (hintsData) {
        try {
          questionData.hints = JSON.parse(hintsData);
        } catch (e) {
          questionData.hints = [];
        }
      }

      // Handle expiry date
      const expiryDate = formData.get("expiryDate") as string;
      if (expiryDate) {
        questionData.expiryDate = new Date(expiryDate);
      }

      const file = formData.get("challengeFile") as File;
      
      if (!file) {
        return NextResponse.json(
          { message: "No file uploaded" },
          { status: HttpStatusCode.BadRequest }
        );
      }

      // Validate file type
      const allowedTypes = [
        "application/zip",
        "application/x-zip-compressed",
        "application/pdf",
        "text/plain",
        "application/octet-stream",
        "image/png",
        "image/jpeg",
        "image/jpg"
      ];
      
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { message: "Invalid file type. Allowed: ZIP, PDF, TXT, PNG, JPG" },
          { status: HttpStatusCode.BadRequest }
        );
      }

      // Validate file size (50MB)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        return NextResponse.json(
          { message: "File too large. Max size: 50MB" },
          { status: HttpStatusCode.BadRequest }
        );
      }

      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const extension = path.extname(file.name).toLowerCase() || "";
      const filename = `challenge-${timestamp}-${randomStr}${extension}`;

      // Create upload directory
      const baseDir = process.env.NODE_ENV === "production" ? "/tmp" : path.join(process.cwd(), "public");
      const uploadDir = path.join(baseDir, "challenges", "files");
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
      }

      // Save file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      challengeFile = `/challenges/files/${filename}`;
      questionData.challengeFile = challengeFile;
    } else {
      // Handle JSON data (link-based challenge)
      questionData = await req.json();
      questionData.challengeType = questionData.challengeType || "link";
      questionData.uploadedBy = session.user.email;
    }

    // Validate required fields
    if (
      !questionData.title ||
      !questionData.points ||
      !questionData.category ||
      !questionData.flag ||
      !questionData.description
    ) {
      return NextResponse.json(
        { message: "Missing required fields: title, points, category, flag, description" },
        { status: HttpStatusCode.BadRequest }
      );
    }

    // Create question
    const product = await QuestionModel.create(questionData);
    await product.save();
    
    const challengeLink = `https://flagforgectf.com/problems/${product._id}`;

    // Send Discord notification
    await sendDiscordNotification(
      "🧩 New Challenge Released!",
      questionData.description,
      "NEW_CHALLENGE",
      questionData.points,
      questionData.category,
      challengeLink
    );

    return NextResponse.json(
      { success: true, message: "Your question has been created" },
      { status: HttpStatusCode.Created }
    );
  } catch (error: any) {
    console.error("Error creating challenge:", error);
    return NextResponse.json(
      { message: error?.message || "Failed to create challenge" },
      { status: HttpStatusCode.BadRequest }
    );
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const qpage = parseInt(searchParams.get("page") ?? "1", 10);
  const page: number = Number.isFinite(qpage) && qpage > 0 ? qpage : 1;

  // Allow custom limit from query params, default to 8 for normal pagination.
  // Clamped to 1..1000 (the "all challenges" views request up to 1000).
  const requestedLimit = parseInt(searchParams.get("limit") ?? "8", 10);
  const limit = Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 8, 1), 1000);

  // Get category filter from query params
  const category = searchParams.get("category");

  const startIndex = (page - 1) * limit;
  const session = await getServerSession(authOptions);

  // Allow public access to browse problems
  // Authentication will be required only for solving challenges

  try {
    await connect();

    // Build the base query - exclude flag
    let baseQuery = {};

    // Add category filter if provided and not "All"
    if (category && category !== "All") {
      baseQuery = { category: category };
    }

    // Build the query with category filter. Hint text is only served via
    // /api/problems/[id]/hints once unlocked, so never include it here.
    let query = QuestionModel.find(baseQuery).select("-flag -hints.text");

    // Add sorting - newest first by default
    query = query.sort({ createdAt: -1 });

    query = query.skip(startIndex).limit(limit);

    const questions = await query.exec();

    let user = null;
    let userQuestion = [];
    let totalScore = 0;

    // Only fetch user data if session exists
    if (session?.user?.email) {
      user = await userSchema.findOne({ email: session.user.email });
      if (user) {
        userQuestion = await UserQuestionModel.find({ userId: user.id });
        totalScore = user.totalScore || 0;
      }
    }

    // Get total count for pagination info (with category filter applied)
    const totalQuestions = await QuestionModel.countDocuments(baseQuery);

    // Get solve counts for all these questions
    const questionIds = questions.map((q) => q._id);
    const solveCounts = await UserQuestionModel.aggregate([
      { $match: { questionId: { $in: questionIds } } },
      { $group: { _id: "$questionId", count: { $sum: 1 } } }
    ]);
    
    const solveCountMap = solveCounts.reduce((acc, curr) => {
      acc[curr._id.toString()] = curr.count;
      return acc;
    }, {} as Record<string, number>);

    // Process questions to add expiry information
    const now = new Date();
    const processedQuestions = questions.map((question) => {
      const questionObj = question.toObject();

      // Check if question has expired
      if (questionObj.expiryDate) {
        const expiryDate = new Date(questionObj.expiryDate);
        questionObj.expired = expiryDate < now;
        questionObj.timeRemaining = Math.max(
          0,
          expiryDate.getTime() - now.getTime()
        );
      } else {
        questionObj.expired = false;
        questionObj.timeRemaining = null;
      }

      questionObj.solveCount = solveCountMap[questionObj._id.toString()] || 0;
      questionObj.points = challengeValue(questionObj.points, questionObj.solveCount);

      return questionObj;
    });

    return NextResponse.json({
      data: processedQuestions,
      totalScore: totalScore,
      questionDone: userQuestion,
      pagination: {
        page,
        limit,
        total: totalQuestions,
        totalPages: Math.ceil(totalQuestions / limit),
        hasNext: page < Math.ceil(totalQuestions / limit),
        hasPrev: page > 1,
      },
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: HttpStatusCode.InternalServerError }
    );
  }
}
