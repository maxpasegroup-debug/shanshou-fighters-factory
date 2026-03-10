import { NextResponse } from "next/server";

import { handleApiError } from "@/lib/api";
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
    return handleApiError("reviews/course", error);
  }
}
