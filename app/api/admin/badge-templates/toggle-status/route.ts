import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import connect from "@/utils/db";
import BadgeTemplate from "@/models/badgeTemplateSchema";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck;

    await connect();

    const body = await request.json();
    const { templateId, isActive } = body;

    // 1️⃣ Validate templateId
    if (!templateId) {
      return NextResponse.json(
        { error: "Template ID is required" },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(templateId)) {
      return NextResponse.json(
        { error: "Invalid template ID format" },
        { status: 400 }
      );
    }

    // 2️⃣ Validate isActive
    if (isActive === undefined || isActive === null) {
      return NextResponse.json(
        { error: "isActive status is required" },
        { status: 400 }
      );
    }

    // 3️⃣ Find the template
    const template = await BadgeTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Badge template not found" },
        { status: 404 }
      );
    }

    // 4️⃣ Update the active status
    template.isActive = Boolean(isActive);
    template.updatedAt = new Date();
    await template.save();

    console.log(
      `✅ Badge template status updated: ${template.name} - ${
        isActive ? "activated" : "deactivated"
      }`
    );

    // 5️⃣ Return response
    return NextResponse.json({
      success: true,
      template,
      message: `Badge template ${
        isActive ? "activated" : "deactivated"
      } successfully`,
    });
  } catch (error) {
    console.error("❌ Badge template status update error:", error);
    return NextResponse.json(
      { error: "Failed to update badge template status" },
      { status: 500 }
    );
  }
}
