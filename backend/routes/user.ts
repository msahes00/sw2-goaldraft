import { Router } from "jsr:@oak/oak/router";
import { getUser, updateUser } from "../controllers/user.ts";

const router = new Router();

/**
 * GET /users/:username
 * Fetch user data by username
 */
router.get("/users/:username", getUser);

/**
 * PUT /users/:username
 * Update user data
 */
router.put("/users/:username", updateUser);

export default router;