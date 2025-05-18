import { Router } from "jsr:@oak/oak/router";
import { connect } from "../controllers/db.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { hash, compare } from "https://deno.land/x/bcrypt/mod.ts";

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

  if (results.length === 0) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid username or password" };
    return;
  }

  const user = results[0];
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    ctx.response.status = 401;
    ctx.response.body = { error: "Invalid username or password" };
    return;
  }

  ctx.response.body = { message: "Login successful", username };
});

// POST /register
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

  const { username, password } = body;

  if (!username || !password) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Username and password are required." };
    return;
  }

  const [existing] = await sequelize.query(
    "SELECT username FROM users WHERE username = ?",
    { replacements: [username] }
  );

  if (existing.length > 0) {
    ctx.response.status = 409; // Conflict
    ctx.response.body = { error: "Username already exists." };
    return;
  }

  const hashedPassword = await hash(password);

  try {
    await sequelize.query(
      `INSERT INTO users (username, password, coins, collection) VALUES (?, ?, ?, ?)`,
      {
        replacements: [username, hashedPassword, 0, null],
      }
    );

    ctx.response.status = 201;
    ctx.response.body = { message: "User registered successfully", username };
  } catch (error) {
    console.error("DB error during registration:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to register user." };
  }
});


export default router;
