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

      // TODO: Return a custom 404 error page
      ctx.response.status = 404;
      await send(ctx, "/404.html", {
        root: `${Deno.cwd()}/backend/views`,
      });
    }
  });

// Export the router
export default router;