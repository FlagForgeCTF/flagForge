import connect from "@/utlis/db";
import { NextRequest, NextResponse } from "next/server";
import QuestionModel from "@/models/qustionsSchema";
import { Questions } from "@/interfaces";
import { HttpStatusCode } from "axios";
import userSchema from "@/models/userSchema";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import UserQuestionModel from "@/models/userQuestionSchema";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    await connect();
    const body: Questions = await req.json();
    if (body.title && body.points && body.category && body.flag && body.description) {
      const product = await QuestionModel.create(body);
      console.log(product);

      return NextResponse.json(
        { success: true, message: "Your qustion has been created" },
        { status: HttpStatusCode.Created }
      );
    }
    return NextResponse.json(
      { message: "Something is missing!" },
      { status: HttpStatusCode.BadRequest }
    );
  } catch (error: any) {
    console.log(error);
    return NextResponse.json(
      { message: error?.message },
      { status: HttpStatusCode.BadRequest }
    );
  }
}
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const qpage = parseInt(searchParams.get("page") ?? "1", 10);
  const page: number = qpage;
  const limit = 8;
  const startIndex = (page - 1) * limit;
  const session = await getServerSession(authOptions);

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }
  try {
    await connect();
    const questions = await QuestionModel.find().select('-flag').skip(startIndex).limit(limit);

    const user = await userSchema.findOne({ email: session?.user?.email });
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: HttpStatusCode.NotFound }
      );
    }

    const userQuestion = await UserQuestionModel.find({ userId: user.id });

    return NextResponse.json({ data: questions, totalScore: user.totalScore, questionDone: userQuestion });
  } catch (error) {
    return NextResponse.json({ error });
  }
}
