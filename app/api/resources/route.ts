import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connectDB from "@/utils/db";
import userSchema from "@/models/userSchema";
import ResourceModel from "@/models/Resource";

const RESOURCES_PER_PAGE = 12;

// authorization middleware
async function requireAdmin(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.email) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }
  await connectDB();
  const user = await userSchema.findOne({ email: session.user.email });
  if (!user || user.role !== "Admin") {
    return NextResponse.json(
      { success: false, error: "Admin privileges required" },
      { status: 403 }
    );
  }
  return null; // Means admin check passed
}

// GET /api/resources
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10) || 1, 1);
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    // Build filter query
    const filter: any = {};

    if (category && category !== "All") {
      filter.category = category;
    }

    if (search) {
      // Escape regex characters to prevent ReDoS/injection
      const safeSearch = search.slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (page - 1) * RESOURCES_PER_PAGE;

    // Get resources with pagination
    const resources = await ResourceModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(RESOURCES_PER_PAGE)
      .lean();

    // Get total count for pagination
    const totalResources = await ResourceModel.countDocuments(filter);
    const totalPages = Math.ceil(totalResources / RESOURCES_PER_PAGE);

    // Get unique categories for filter dropdown
    const categoriesAggregation = await ResourceModel.aggregate([
      { $group: { _id: "$category" } },
      { $sort: { _id: 1 } },
    ]);

    const categories = ["All", ...categoriesAggregation.map((cat) => cat._id)];

    return NextResponse.json({
      success: true,
      data: resources,
      pagination: {
        currentPage: page,
        totalPages,
        totalResources,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      categories,
    });
  } catch (error) {
    console.error("Error fetching resources:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch resources" },
      { status: 500 }
    );
  }
}

// POST /api/resources
export async function POST(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck; // Return if not admin
  try {
    await connectDB();

    const body = await request.json();
    const { title, description, category, resourceLink, uploadedBy } = body;

    // Validate required fields
    if (!title || !description || !category || !resourceLink || !uploadedBy) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(resourceLink);
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid resource link URL" },
        { status: 400 }
      );
    }

    // Check if resource with same title already exists
    const existingResource = await ResourceModel.findOne({ title });
    if (existingResource) {
      return NextResponse.json(
        { success: false, message: "Resource with this title already exists" },
        { status: 400 }
      );
    }

    // Create new resource
    const newResource = new ResourceModel({
      title,
      description,
      category,
      resourceLink,
      uploadedBy,
    });

    await newResource.save();

    return NextResponse.json(
      {
        success: true,
        message: "Resource uploaded successfully",
        data: newResource,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating resource:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create resource" },
      { status: 500 }
    );
  }
}

// DELETE /api/resources
export async function DELETE(request: NextRequest) {
  const adminCheck = await requireAdmin(request);
  if (adminCheck) return adminCheck; // Return if not admin
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const resourceId = searchParams.get("id");

    if (!resourceId) {
      return NextResponse.json(
        { success: false, message: "Resource ID is required" },
        { status: 400 }
      );
    }

    const deletedResource = await ResourceModel.findByIdAndDelete(resourceId);

    if (!deletedResource) {
      return NextResponse.json(
        { success: false, message: "Resource not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Resource deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting resource:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete resource" },
      { status: 500 }
    );
  }
}
