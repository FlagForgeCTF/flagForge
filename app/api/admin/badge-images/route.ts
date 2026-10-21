// api/badge-images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/requireAdmin";
import connect from "@/utils/db";
import { writeFile, mkdir, unlink } from "fs/promises";
import path from "path";
import { existsSync } from "fs";
import {
  BadgeImage,
  BadgeImageCreate,
  BadgeImageResponse,
  BadgeImageListResponse,
  BadgeImageUploadResponse,
  BadgeImageDeleteResponse,
  BadgeImageErrorResponse,
  ALLOWED_IMAGE_TYPES,
  MAX_FILE_SIZE,
} from "@/types/badgeImage";
import BadgeImageModel from "@/models/badgeImage";

export const runtime = "nodejs";

// GET - Fetch all badge images
export async function GET(
  request: NextRequest,
): Promise<NextResponse<BadgeImageListResponse | BadgeImageErrorResponse>> {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck;

    await connect();

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category: string = searchParams.get("category") || "badge-template";

    const badgeImages = await BadgeImageModel.find({ category })
      .sort({ uploadedAt: -1 })
      .select("-__v") // Exclude version key
      .lean();

    console.log(`Fetched ${badgeImages.length} badge images`);

    const response: BadgeImageListResponse = {
      success: true,
      images: badgeImages as unknown as BadgeImage[],
      count: badgeImages.length,
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error("Badge image fetch error:", error);

    const errMsg =
      error instanceof Error ? error.message : "Unexpected error occurred";

    const errorResponse: BadgeImageErrorResponse = {
      success: false,
      error: "Failed to fetch badge images",
      details: errMsg,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// POST - Upload and save badge image metadata
export async function POST(
  request: NextRequest,
): Promise<NextResponse<BadgeImageUploadResponse | BadgeImageErrorResponse>> {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck;

    const formData = await request.formData();
    const file = formData.get("badge-image") as File | null;
    const name = formData.get("name") as string | null;
    const category = (formData.get("category") as string) || "badge-template";
    const uploadedBy = (formData.get("uploadedBy") as string) || "unknown";

    // Validate file presence
    if (!file) {
      const errorResponse: BadgeImageErrorResponse = {
        success: false,
        error: "No file uploaded",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate file type
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as any)) {
      const errorResponse: BadgeImageErrorResponse = {
        success: false,
        error:
          "Invalid file type. Please upload PNG, JPG, WebP, SVG, or GIF images.",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      const errorResponse: BadgeImageErrorResponse = {
        success: false,
        error: "File too large. Maximum size is 5MB.",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Generate unique filename
    const timestamp: number = Date.now();
    const randomStr: string = Math.random().toString(36).substring(2, 15);
    const extension: string = path.extname(file.name).toLowerCase() || ".png";
    const filename: string = `badge-${timestamp}-${randomStr}${extension}`;

    // Ensure upload directory exists
    const uploadDir: string = path.join(
      process.cwd(),
      "public",
      "badges",
      "custom",
    );
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath: string = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    // Create public URL path
    const imagePath: string = `/badges/custom/${filename}`;

    // Connect to database and save metadata
    await connect();

    const badgeImageData: BadgeImageCreate = {
      name: name || file.name.split(".")[0],
      originalName: file.name,
      filename,
      path: imagePath,
      category,
      size: file.size,
      mimeType: file.type,
      uploadedAt: new Date(),
      uploadedBy,
    };

    const createdImage = await BadgeImageModel.create(badgeImageData);

    console.log(`Badge image uploaded and saved to DB: ${imagePath}`);

    const successResponse: BadgeImageUploadResponse = {
      success: true,
      imagePath,
      filename,
      imageId: createdImage._id.toString(),
      message: "Badge image uploaded successfully",
    };

    return NextResponse.json(successResponse);
  } catch (error: unknown) {
    console.error("Badge image upload error:", error);

    const errMsg =
      error instanceof Error ? error.message : "Unexpected error occurred";

    const errorResponse: BadgeImageErrorResponse = {
      success: false,
      error: "Failed to upload badge image",
      details: errMsg,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// DELETE - Remove badge image and its file
export async function DELETE(
  request: NextRequest,
): Promise<NextResponse<BadgeImageDeleteResponse | BadgeImageErrorResponse>> {
  try {
    const adminCheck = await requireAdmin();
    if (adminCheck) return adminCheck;

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("id");

    if (!imageId) {
      const errorResponse: BadgeImageErrorResponse = {
        success: false,
        error: "Image ID is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    await connect();

    // Find the image document first
    const imageDoc = await BadgeImageModel.findById(imageId);

    if (!imageDoc) {
      const errorResponse: BadgeImageErrorResponse = {
        success: false,
        error: "Image not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    // Delete the file from filesystem
    const filePath = path.join(process.cwd(), "public", imageDoc.path);
    try {
      if (existsSync(filePath)) {
        await unlink(filePath);
        console.log(`File deleted: ${filePath}`);
      }
    } catch (fileError) {
      console.warn(`Failed to delete file: ${filePath}`, fileError);
      // Continue with database deletion even if file deletion fails
    }

    // Delete from database
    await BadgeImageModel.findOneAndDelete({ _id: { $eq: imageId } });

    console.log(`Badge image deleted: ${imageId}`);

    const successResponse: BadgeImageDeleteResponse = {
      success: true,
      message: "Badge image deleted successfully",
    };

    return NextResponse.json(successResponse);
  } catch (error: unknown) {
    console.error("Badge image deletion error:", error);

    const errMsg =
      error instanceof Error ? error.message : "Unexpected error occurred";

    const errorResponse: BadgeImageErrorResponse = {
      success: false,
      error: "Failed to delete badge image",
      details: errMsg,
    };

    return NextResponse.json(errorResponse, { status: 500 });
  }
}
