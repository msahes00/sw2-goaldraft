import { Context } from "jsr:@oak/oak/context";
import { User } from "../models/user.ts";

/**
 * Get user data by username
 */
const getUser = async (ctx: Context) => {
  try {
    const { username } = ctx.params;
    if (!username) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Username is required" };
      return;
    }

    const user = await User.findOne({ where: { username } });
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }

    ctx.response.status = 200;
    ctx.response.body = user;
  } catch (error) {
    console.error("Error fetching user:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
};

/**
 * Update user data
 */
const updateUser = async (ctx: Context) => {
  try {
    const { username } = ctx.params;
    if (!username) {
      ctx.response.status = 400;
      ctx.response.body = { error: "Username is required" };
      return;
    }

    const { newUsername, password } = await ctx.request.body.json();

    const user = await User.findOne({ where: { username } });
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }

    if (newUsername && newUsername !== username) {
      const exists = await User.findOne({ where: { username: newUsername } });
      if (exists) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Username already exists" };
        return;
      }
      user.username = newUsername;
    }

    if (password) {
      user.password = password;
    }

    await user.save();

    ctx.response.status = 200;
    ctx.response.body = { message: "User updated successfully" };
  } catch (error) {
    console.error("Error updating user:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Internal server error" };
  }
};

export { getUser, updateUser };