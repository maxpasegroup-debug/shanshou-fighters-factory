import { NextResponse } from "next/server";

import { connectToDatabase } from "@/lib/mongodb";
import Review from "@/models/Review";

type Params = {
  params: { courseId: string };
};

export async function GET(_: Request, { params }: Params) {
  try {
    await connectToDatabase();
    const reviews = await Review.find({ courseId: params.courseId })
      .populate("userId", "name avatar")
      .sort({ createdAt: -1 })
      .lean();
    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch course reviews", details: `${error}` },
      { status: 500 },
    );
  }
}
