import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  MONGODB_URI: z.string().optional(),
  NEXTAUTH_SECRET: z.string().optional(),
  NEXTAUTH_URL: z.string().optional(),
  STRIPE_SECRET: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  READY_CHECK_SECRET: z.string().optional(),
});

type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

export function getEnv() {
  if (cached) return cached;
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues.map((item) => `${item.path.join(".")}: ${item.message}`).join("; ");
    throw new Error(`Environment validation failed: ${message}`);
  }
  const env = parsed.data;
  cached = env;
  return env;
}
