import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { handleApiError, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/Review";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const courseId = url.searchParams.get("courseId");

    await connectToDatabase();
    const query = courseId ? { courseId } : {};
    const reviews = await Review.find(query).populate("userId", "name avatar").lean();
    return NextResponse.json(reviews);
  } catch (error) {
    return handleApiError("reviews/list", error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return unauthorized();

    const { courseId, rating, comment } = await request.json();
    if (!courseId || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await connectToDatabase();
    const review = await Review.findOneAndUpdate(
      { userId: session.user.id, courseId },
      { userId: session.user.id, courseId, rating, comment },
      { upsert: true, new: true },
    );

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return handleApiError("reviews/save", error);
  }
}
