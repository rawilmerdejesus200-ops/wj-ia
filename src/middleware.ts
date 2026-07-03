import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: ["/chat/:path*", "/images/:path*", "/video/:path*", "/code/:path*", "/audio/:path*", "/documents/:path*", "/settings/:path*"],
}
