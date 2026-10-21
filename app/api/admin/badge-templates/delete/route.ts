import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import connect from "@/utils/db";
import BadgeTemplate from "@/models/badgeTemplateSchema";
import User from "@/models/userSchema";
import mongoose from "mongoose";

export const runtime = "nodejs";

export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck;

    await connect();

    const body = await request.json();
    const { templateId } = body;

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

    // Check if template exists
    const template = await BadgeTemplate.findById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: "Badge template not found" },
        { status: 404 }
      );
    }

    // Check if template is being used in any assigned badges
    const usageCount = await User.countDocuments({
      "customBadges.name": template.name,
    });

    if (usageCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete template. It is currently used by ${usageCount} assigned badge(s).`,
          inUse: true,
          usageCount,
        },
        { status: 400 }
      );
    }

    // Delete the template
    await template.deleteOne();

    console.log(`Badge template deleted: ${template.name}`);

    return NextResponse.json({
      success: true,
      deletedTemplate: {
        id: template._id,
        name: template.name,
      },
      message: "Badge template deleted successfully",
    });
  } catch (error) {
    console.error("Badge template deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete badge template" },
      { status: 500 }
    );
  }
}
