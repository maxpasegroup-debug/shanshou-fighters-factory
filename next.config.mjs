import withPWA from "next-pwa";
import runtimeCaching from "next-pwa/cache.js";

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  runtimeCaching,
  fallbacks: {
    document: "/offline",
  },
})(nextConfig);
