import { v2 as cloudinary } from "cloudinary";
import { getEnv } from "@/lib/env";

const env = getEnv();

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_SECRET,
});

export async function uploadVideo(file: string) {
  return cloudinary.uploader.upload(file, {
    resource_type: "video",
    folder: "sanshou/videos",
  });
}

export async function uploadImage(file: string) {
  return cloudinary.uploader.upload(file, {
    resource_type: "image",
    folder: "sanshou/images",
  });
}

export async function deleteMedia(publicId: string, resourceType: "image" | "video" = "image") {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}
