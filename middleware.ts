import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"
import { clerkClient } from "@clerk/clerk-sdk-node"

const isPublicRoute = createRouteMatcher([
  "/",
  "/api/webhook/register",
  "/sign-in",
  "/sign-up",
])

export default clerkMiddleware(async (auth, req) => {
  //   const client = await clerkClient()
  const { userId } = await auth()

  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url))
  }

  if (userId) {
    try {
      const user = await clerkClient.users.getUser(userId) // Fetch user data from Clerk
      const role = user.publicMetadata.role as string | undefined
      console.log(role)

      // Admin role redirection logic
      if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url))
      }

      // Prevent non-admin users from accessing admin routes
      if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/dashboard", req.url))
      }

      // Redirect authenticated users trying to access public routes
      if (isPublicRoute(req)) {
        return NextResponse.redirect(
          new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
        )
      }
    } catch (error) {
      console.error("Error fetching user data from Clerk:", error)
      return NextResponse.redirect(new URL("/error", req.url))
    }
  }
})

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
}

//Testing to creat the authMiddleware

// // import { authMiddleware, clerkClient } from "@clerk/nextjs/server"
// import {
//   clerkMiddleware,
//   createRouteMatcher,
//   clerkClient,
// } from "@clerk/nextjs/server"
// import { NextResponse } from "next/server"

// // const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"])
// const isPublicRoute = createRouteMatcher([
//   "/",
//   "/api/webhook/register",
//   "/sign-in",
//   "/sign-up",
// ])

// // const publicRoutes = ["/", "/api/webhook/register", "/sign-in", "/sign-up"]

// export default clerkMiddleware(async (auth, req) => {
//   // if (!isPublicRoute(req)) {
//   //   await auth.protect()
//   // }
//   const client = await clerkClient()
//   const { userId } = await auth()

//   if (!userId && !isPublicRoute(req)) {
//     return NextResponse.redirect(new URL("/sign-in", req.url))
//   }

//   if (userId) {
//     try {
//       const user = await client.users.getUser(userId) // Fetch user data from Clerk
//       const role = user.publicMetadata.role as string | undefined

//       // Admin role redirection logic
//       if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
//         return NextResponse.redirect(new URL("/admin/dashboard", req.url))
//       }

//       // Prevent non-admin users from accessing admin routes
//       if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
//         return NextResponse.redirect(new URL("/dashboard", req.url))
//       }

//       // Redirect authenticated users trying to access public routes
//       if (isPublicRoute(req)) {
//         return NextResponse.redirect(
//           new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", req.url)
//         )
//       }
//     } catch (error) {
//       console.error("Error fetching user data from Clerk:", error)
//       return NextResponse.redirect(new URL("/error", req.url))
//     }
//   }
// })

// // export default authMiddleware({
// // publicRoutes,
// //   async afterAuth(auth, req) {
// //     // Use 'auth' for authentication details and 'req' for NextRequest
// //     // Handle unauthenticated users trying to access protected routes
// //     if (!auth.userId && !publicRoutes.includes(req.nextUrl.pathname)) {
// //       return NextResponse.redirect(new URL("/sign-in", req.url))
// //     }

// //     if (auth.userId) {
// //       try {
// //         const user = await clerkClient.users.getUser(auth.userId) // Fetch user data from Clerk
// //         const role = user.publicMetadata.role as string | undefined

// //         // Admin role redirection logic
// //         if (role === "admin" && req.nextUrl.pathname === "/dashboard") {
// //           return NextResponse.redirect(new URL("/admin/dashboard", req.url))
// //         }

// //         // Prevent non-admin users from accessing admin routes
// //         if (role !== "admin" && req.nextUrl.pathname.startsWith("/admin")) {
// //           return NextResponse.redirect(new URL("/dashboard", req.url))
// //         }

// //         // Redirect authenticated users trying to access public routes
// //         if (publicRoutes.includes(req.nextUrl.pathname)) {
// //           return NextResponse.redirect(
// //             new URL(
// //               role === "admin" ? "/admin/dashboard" : "/dashboard",
// //               req.url
// //             )
// //           )
// //         }
// //       } catch (error) {
// //         console.error("Error fetching user data from Clerk:", error)
// //         return NextResponse.redirect(new URL("/error", req.url))
// //       }
// //     }
// //   },
// // })

// export const config = {
//   matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
// }
