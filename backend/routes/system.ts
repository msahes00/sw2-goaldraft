// Import dependencies
import { Router } from "jsr:@oak/oak/router";
import * as system from "../controllers/system.ts";
import * as db from "../controllers/db.ts";
import * as tunnel from "../controllers/localtunnel.ts";

// Create the router instance
const router = new Router();

/*
 * GET /reload
 * Restarts the server
 * OK: 200 no content
 * Error: 500 if an error has occurred
 */
//router.get("/reload", (_ctx) => system.reload());

/*
 * GET /status
 * Provides the server status
 * OK: 200 with status information
 * Error: 500 if an error has occurred
 */
router.get("/status", async (ctx) => ctx.response.body = await system.status());

/*
 * GET /db
 * Provides the database connection status
 * OK: 200 with status information
 * Error: 500 if an error has occurred
 */
router.get("/db", async (ctx) => ctx.response.body = await db.status());

/*
 * GET /tunnel
 * Provides the tunnel status
 * OK: 200 with status information
 * Error: 500 if an error has occurred
 */
router.get("/tunnel", (ctx) => ctx.response.body = tunnel.status());

/*
 * GET /tunnel/connect
 * Connects to the tunnel if it was not already connected
 * OK: 200 if successfully connected
 * Error: 500 if an error has occurred
 */
router.get("/tunnel/connect", async (ctx) => ctx.response.status = await tunnel.connect() ? 200 : 500);

/*
 * GET /tunnel/disconnect
 * Disconnects from the tunnel if it was connected
 * OK: 200 if successfully disconnected
 * Error: 500 if an error has occurred
 */
router.get("/tunnel/disconnect", (ctx) => ctx.response.status = tunnel.disconnect() ? 200 : 500);


// Export the router
export default router;