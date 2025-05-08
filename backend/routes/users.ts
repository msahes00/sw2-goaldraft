import { Router } from "jsr:@oak/oak/router";
import { connect } from "../controllers/db.ts";

const router = new Router();

// Get user data
router.get("/users/:username", async (ctx) => {
  const sequelize = await connect();
  if (!sequelize) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Database connection failed" };
    return;
  }

  const { username } = ctx.params;
  const [results] = await sequelize.query(
    `SELECT username, coins, colection FROM users WHERE username = ?`,
    { replacements: [username] }
  );

  if (results.length === 0) {
    ctx.response.status = 404;
    ctx.response.body = { error: "User not found" };
    return;
  }

  ctx.response.body = results[0];
});

// Update user data
router.put("/users/:username", async (ctx) => {
  const sequelize = await connect();
  if (!sequelize) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Database connection failed" };
    return;
  }

  const { username } = ctx.params;
  const { coins, colection } = await ctx.request.body({ type: "json" }).value;

  await sequelize.query(
    `UPDATE users SET coins = ?, colection = ? WHERE username = ?`,
    { replacements: [coins, colection, username] }
  );

  ctx.response.body = { message: "User updated successfully" };
});

export default router;