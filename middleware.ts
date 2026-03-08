import { withAuth } from "next-auth/middleware";

export default withAuth(
  function middleware() {
    return;
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        if (pathname.startsWith("/trainer/dashboard")) {
          return token?.role === "trainer" || token?.role === "admin";
        }

        if (pathname.startsWith("/admin")) {
          return token?.role === "admin";
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/trainer/dashboard/:path*", "/admin/:path*"],
};
