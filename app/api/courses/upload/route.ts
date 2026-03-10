import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { badRequest, handleApiError, unauthorized } from "@/lib/api";
import { authOptions } from "@/lib/auth";
import { uploadImage, uploadVideo } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "trainer" && session.user.role !== "admin")) {
      return unauthorized();
    }

    const { file, type } = await request.json();
    if (!file || !type) {
      return badRequest("file and type are required");
    }

    const result = type === "video" ? await uploadVideo(file) : await uploadImage(file);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError("courses/upload", error);
  }
}
