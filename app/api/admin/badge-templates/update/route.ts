import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import connect from "@/utils/db";
import BadgeTemplate from "@/models/badgeTemplateSchema";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function PUT(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck;

    await connect();

    const body = await request.json();
    const { templateId, name, description, icon, color, isActive } = body;

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

    // 2️⃣ Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Badge name is required" },
        { status: 400 }
      );
    }

    if (!description || !description.trim()) {
      return NextResponse.json(
        { error: "Badge description is required" },
        { status: 400 }
      );
    }

    if (!icon || !icon.trim()) {
      return NextResponse.json(
        { error: "Badge icon is required" },
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

    // 4️⃣ Check for duplicate name (excluding current template)
    const duplicate = await BadgeTemplate.findOne({
      name: name.trim(),
      _id: { $ne: templateId },
    });
    if (duplicate) {
      return NextResponse.json(
        { error: "A badge template with this name already exists" },
        { status: 400 }
      );
    }

    // 5️⃣ Update the template
    template.name = name.trim();
    template.description = description.trim();
    template.icon = icon.trim();
    template.color = color || "#8B5CF6";
    template.isActive = isActive !== undefined ? isActive : true;
    template.updatedAt = new Date();

    await template.save();

    console.log(`✅ Badge template updated: ${name}`);

    return NextResponse.json({
      success: true,
      template,
      message: "Badge template updated successfully",
    });
  } catch (error) {
    console.error("❌ Badge template update error:", error);
    return NextResponse.json(
      { error: "Failed to update badge template" },
      { status: 500 }
    );
  }
}
