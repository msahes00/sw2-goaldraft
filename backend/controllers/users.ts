import { connect } from "./db.ts";
import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { hash } from "https://deno.land/x/bcrypt/mod.ts";
import type { Context } from "jsr:@oak/oak/context";

export const getUser = async (ctx: Context) => {
  const username = ctx.params.username;
  const sequelize = await connect();

  const [results] = await sequelize.query(
    `SELECT username, coins, collection FROM users WHERE username = ?`,
    { replacements: [username] }
  );

  if (results.length === 0) {
    ctx.response.status = 404;
    ctx.response.body = { error: "User not found" };
    return;
  }

  ctx.response.body = results[0];
};

export const updateUser = async (ctx: Context) => {
  const username = ctx.params.username;
  const sequelize = await connect();

  const body = await ctx.request.body.json();
  const { coins, collection } = body;

  try {
    await sequelize.query(
      `UPDATE users SET coins = ?, collection = ? WHERE username = ?`,
      { replacements: [coins, collection, username] }
    );

    ctx.response.body = { message: "User updated successfully" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to update user" };
  }
};

export const registerUser = async (ctx: Context) => {
  const sequelize = await connect();

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
    ctx.response.status = 409;
    ctx.response.body = { error: "Username already exists." };
    return;
  }

  const hashedPassword = await hash(password);

  try {
    await sequelize.query(
      `INSERT INTO users (username, password, coins, collection) VALUES (?, ?, ?, ?)`,
      { replacements: [username, hashedPassword, 0, null] }
    );

    ctx.response.status = 201;
    ctx.response.body = { message: "User registered successfully", username };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to register user." };
  }
};

export const loginUser = async (ctx: Context) => {
  const sequelize = await connect();

  if (!ctx.request.hasBody) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Request body is missing" };
    return;
  }

  const body = await ctx.request.body.json();
  const { username, password } = body;

  if (!username || !password) {
    ctx.response.status = 400;
    ctx.response.body = { error: "Username and password are required" };
    return;
  }

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
};
