import { Router } from "jsr:@oak/oak/router";
import { connect } from "../controllers/db.ts";

const router = new Router();

// POST login
router.post("/login", async (ctx) => {
  const sequelize = await connect();
  if (!sequelize) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Database connection failed" };
    return;
  }

  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Request body is missing" };
    return;
  }

  const body = await ctx.request.body.json();

  if (!body || typeof body !== "object" || !body.username || !body.password) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Expected application/json with username and password" };
    return;
  }

  const { username, password } = body;

  const [results] = await sequelize.query(
    `SELECT username, password FROM users WHERE username = ?`,
    { replacements: [username] }
  );

  if (results.length === 0 || results[0].password !== password) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid username or password" };
    return;
  }

  ctx.response.body = { message: "Login successful", username };
});

// POST register
router.post("/register", async (ctx) => {
  const sequelize = await connect();
  if (!sequelize) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Database connection failed" };
    return;
  }

  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Request body is missing" };
    return;
  }

  const body = await ctx.request.body.json();

  if (!body || typeof body !== "object" || !body.username || !body.password) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Expected application/json with username and password" };
    return;
  }

  const { username, password } = body;

  // Check if user already exists
  const [existing] = await sequelize.query(
    `SELECT username FROM users WHERE username = ?`,
    { replacements: [username] }
  );

  if (existing.length > 0) {
    ctx.response.status = 409; // Conflict
    ctx.response.body = { error: "Username already exists" };
    return;
  }

  // Insert new user
  try {
    await sequelize.query(
      `INSERT INTO users (username, password) VALUES (?, ?)`,
      { replacements: [username, password] }
    );

    ctx.response.status = 201; // Created
    ctx.response.body = { message: "Registration successful", username };
  } catch (error) {
    console.error("Registration error:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to register user" };
  }
});

export default router;
