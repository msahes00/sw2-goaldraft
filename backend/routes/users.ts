import { Router } from "jsr:@oak/oak/router";
import { connect } from "../controllers/db.ts";  // Ajusta esto dependiendo de dónde se encuentra tu archivo de conexión a la base de datos

const router = new Router();

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

  const body = await ctx.request.body.value;

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
export default router;
