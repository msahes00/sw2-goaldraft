import { Router } from "jsr:@oak/oak/router";
import { send } from "jsr:@oak/oak/send";

// Prepare the router
const router = new Router();

// Serve the frontend files if they exist
router.get("/:path*", async (ctx) => {
  try {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}/frontend/dist`,
      index: "index.html",
    });
  } catch {
    // Fallback to serving `index.html` for unmatched routes
    await send(ctx, "index.html", {
      root: `${Deno.cwd()}/frontend/dist`,
    });
  }
});

// Export the router
export default router;