// Import dependencies
import { Router } from "jsr:@oak/oak/router";
import * as player from "../controllers/player.ts";

// Create the router instance
const router = new Router();

/*
 * GET /
 * Returns all the players
 * OK: 200 with players information
 * Error: 500 if an error has occurred
 */
router.get("/", player.getAll);

/*
* GET /:id
* Returns the player information
* OK: 200 with players information
* Error: 500 if an error has occurred
*/
router.get("/:id", player.getPlayer);

/*
* GET /:id/image
* Returns the player image
* OK: 200 with players information
* Error: 500 if an error has occurred
*/
router.get("/:id/image", player.getPlayerImage);


/*
 * GET /import/:id
 * Fetch the specified player into the database
 * OK: 200 with players information
 * Error: 500 if an error has occurred
 */
router.get("/import/:id", player.importPlayer);


// Export the router
export default router;
