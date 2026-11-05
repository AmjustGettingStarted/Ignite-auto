import arcjet, { detectBot, shield } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/admin(.*)",
  "/saved-cars(.*)",
  "/reservations(.*)",
]);

// Create Arcjet middleware
const aj = arcjet({
  key: process.env.ARCJET_KEY,
  // characteristics: ["userId"], // Track based on Clerk userId
  rules: [
    // Shield protection for content and security
    shield({
      mode: "LIVE",
    }),
    detectBot({
      mode: process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN", // will block requests in prod, log in dev
      allow: [
        "CATEGORY:SEARCH_ENGINE", // Google, Bing, etc
        // See the full list at https://arcjet.com/bot-list
      ],
    }),
  ],
});

const KEEP_ALIVE_PATH = "/api/cron/keep-alive";

const handler = clerkMiddleware(async (auth, req) => {
  const pathname = req.nextUrl?.pathname ?? "";
  if (pathname === KEEP_ALIVE_PATH || pathname === `${KEEP_ALIVE_PATH}/`) {
    return NextResponse.next();
  }

  const isDevPreview =
    process.env.NODE_ENV !== "production" &&
    req.cookies.get("admin_preview")?.value === "1";

  if (!isDevPreview && process.env.ARCJET_KEY) {
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return NextResponse.json(
          { code: 429, message: "Too Many Requests" },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { code: 403, message: "Forbidden" },
        { status: 403 }
      );
    }
  }

  const { userId } = await auth();

  if (!userId && isProtectedRoute(req) && !isDevPreview) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

export default handler;
export const proxy = handler;

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

