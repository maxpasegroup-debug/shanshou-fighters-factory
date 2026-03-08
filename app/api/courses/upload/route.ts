import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { uploadImage, uploadVideo } from "@/lib/cloudinary";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== "trainer" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { file, type } = await request.json();
    if (!file || !type) {
      return NextResponse.json({ error: "file and type are required" }, { status: 400 });
    }

    const result = type === "video" ? await uploadVideo(file) : await uploadImage(file);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed", details: `${error}` }, { status: 500 });
  }
}
