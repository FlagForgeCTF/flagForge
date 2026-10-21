import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import connect from "@/utils/db";
import UserSchema from "@/models/userSchema";

/**
 * Route-level admin guard (defense in depth on top of middleware/adminToken.ts).
 * Checks the role in the database rather than the JWT, so a demoted admin
 * loses access immediately. Returns an error response, or null if the caller
 * is an admin.
 */
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json(
      { success: false as const, error: "Not authenticated" },
      { status: 401 }
    );
  }
  await connect();
  const user = await UserSchema.findOne({ email: { $eq: session.user.email } });
  if (!user || user.role !== "Admin") {
    return NextResponse.json(
      { success: false as const, error: "Admin privileges required" },
      { status: 403 }
    );
  }
  return null;
}
