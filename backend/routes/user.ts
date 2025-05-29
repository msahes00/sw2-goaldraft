import { Router } from "jsr:@oak/oak/router";
import { getUser, updateUser, registerUser, loginUser } from "../controllers/user.ts";

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

/**
 * POST /register
 * Register a new user
 */
router.post("/register", registerUser);

/**
 * POST /login
 * Login a user
 */
router.post("/login", loginUser);

export default router;