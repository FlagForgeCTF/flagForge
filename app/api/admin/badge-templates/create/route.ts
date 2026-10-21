// File: /api/admin/badge-templates/create/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import connect from "@/utils/db";
import BadgeTemplate from "@/models/badgeTemplateSchema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck;

    await connect(); // connect to MongoDB

    const body = await request.json();
    const { name, description, icon, color, isActive, createdBy } = body;

    // Validation
    if (!name?.trim())
      return NextResponse.json(
        { error: "Badge name is required" },
        { status: 400 }
      );
    if (!description?.trim())
      return NextResponse.json(
        { error: "Badge description is required" },
        { status: 400 }
      );
    if (!icon?.trim())
      return NextResponse.json(
        { error: "Badge icon is required" },
        { status: 400 }
      );
    if (!createdBy?.trim())
      return NextResponse.json(
        { error: "CreatedBy is required" },
        { status: 400 }
      );

    // Check for duplicate name
    const existing = await BadgeTemplate.findOne({ name: name.trim() });
    if (existing)
      return NextResponse.json(
        { error: "A badge template with this name already exists" },
        { status: 400 }
      );

    // Create new template
    const newTemplate = new BadgeTemplate({
      name: name.trim(),
      description: description.trim(),
      icon: icon.trim(),
      color: color || "#8B5CF6",
      isActive: isActive !== undefined ? isActive : true,
      createdBy: createdBy.trim(),
    });

    await newTemplate.save();

    console.log(`Badge template created: ${name} by ${createdBy}`);

    return NextResponse.json({
      success: true,
      template: newTemplate,
      message: "Badge template created successfully",
    });
  } catch (error) {
    console.error("Badge template creation error:", error);
    return NextResponse.json(
      { error: "Failed to create badge template" },
      { status: 500 }
    );
  }
}
