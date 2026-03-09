import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";

import { badRequest, forbidden, handleApiError, unauthorized } from "@/lib/api";
import Course from "@/models/Course";
import Trainer from "@/models/Trainer";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";

const createCourseSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  thumbnail: z.string().url(),
  price: z.number().min(0),
  level: z.string().min(2),
  category: z.string().min(2),
});

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const url = new URL(request.url);
    const mine = url.searchParams.get("mine") === "1";

    await connectToDatabase();
    let query = Course.find();
    if (mine && session?.user.id) {
      const trainer = await Trainer.findOne({ userId: session.user.id }).lean();
      query = Course.find({ trainerId: trainer?._id || null });
    }

    const courses = await query
      .sort({ createdAt: -1 })
      .limit(100)
      .populate({
        path: "trainerId",
        populate: { path: "userId", select: "name avatar" },
      })
      .lean();
    return NextResponse.json(courses);
  } catch (error) {
    return handleApiError("courses/list", error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "trainer" && session.user.role !== "admin")) return unauthorized();

    const payload = createCourseSchema.safeParse(await request.json());
    if (!payload.success) return badRequest(payload.error.issues[0]?.message || "Invalid payload");
    await connectToDatabase();
    const trainer = await Trainer.findOne({ userId: session.user.id });

    if (!trainer && session.user.role === "trainer") {
      return badRequest("Trainer profile required");
    }

    if (session.user.role === "trainer" && !trainer?.approved) {
      return forbidden("Trainer profile must be approved by admin");
    }

    const course = await Course.create({
      ...payload.data,
      trainerId: trainer?._id,
    });

    if (trainer) {
      trainer.courses.push(course._id);
      await trainer.save();
    }

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    return handleApiError("courses/create", error);
  }
}
