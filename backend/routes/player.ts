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
 * POST /search
 * Search for players in the database
 * OK: 200 with players information
 * Error: 500 if an error has occurred
 */
router.post("/search", player.search);

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

/*
 * GET /random/:position
 * Returns a random selection of 5 players for the given position
 * OK: 200 with player information
 * Error: 400 if position is invalid, 500 if an error has occurred
 */
router.get("/random/:position",player.getRandomPlayersByPosition);

// Export the router
export default router;
