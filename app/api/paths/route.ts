import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import connect from "@/utils/db";
import PathModel from "@/models/pathSchema";
import { authOptions } from "@/lib/authOptions";
import { requireAdmin } from "@/lib/requireAdmin";
import { getSolvedIds, parsePathInput, slugify } from "@/lib/paths";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/paths - all paths with the caller's progress
export async function GET() {
  try {
    await connect();
    const [paths, solved] = await Promise.all([
      PathModel.find({}).sort({ createdAt: 1 }).lean<any[]>(),
      getSolvedIds(),
    ]);

    return NextResponse.json({
      success: true,
      paths: paths.map((p) => ({
        _id: p._id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        difficulty: p.difficulty,
        total: p.challenges.length,
        completed: p.challenges.filter((id: unknown) => solved.has(String(id))).length,
      })),
    });
  } catch (error) {
    console.error("Error fetching paths:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch paths" }, { status: 500 });
  }
}

// POST /api/paths - admin creates a path
export async function POST(req: NextRequest) {
  const denied = await requireAdmin();
  if (denied) return denied;

  try {
    await connect();
    const parsed = await parsePathInput(await req.json().catch(() => null));
    if (parsed.error) return NextResponse.json({ success: false, message: parsed.error }, { status: 400 });

    const session = await getServerSession(authOptions);
    const path = await PathModel.create({
      ...parsed.data,
      slug: slugify(parsed.data!.title),
      createdBy: session!.user!.email,
    });
    return NextResponse.json({ success: true, path }, { status: 201 });
  } catch (error: any) {
    if (error?.code === 11000) {
      return NextResponse.json({ success: false, message: "A path with this title already exists" }, { status: 409 });
    }
    console.error("Error creating path:", error);
    return NextResponse.json({ success: false, message: "Failed to create path" }, { status: 500 });
  }
}
