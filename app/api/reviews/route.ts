import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

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
    return NextResponse.json({ error: "Failed to fetch reviews", details: `${error}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    return NextResponse.json({ error: "Failed to save review", details: `${error}` }, { status: 500 });
  }
}
