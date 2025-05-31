import * as bcrypt from "https://deno.land/x/bcrypt/mod.ts";
import { hash } from "https://deno.land/x/bcrypt/mod.ts";
import type { Context } from "jsr:@oak/oak/context";
import { connect } from "./db.ts";
import { User } from "../models/user.ts";
import { Player } from "../models/player.ts"

export const getUser = async (ctx: Context) => {
  await connect();
  const username = ctx?.params?.username;
  try {
    const user = await User.findOne({
      where: { username },
      attributes: ["username", "coins"],
    });
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }
    ctx.response.body = user;
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to fetch user" };
  }
};

export const updateUser = async (ctx: Context) => {
  await connect();
  const username = ctx?.params?.username;
  const body = await ctx.request.body.json();
  const { newUsername, password } = body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "User not found" };
      return;
    }

    if (newUsername && newUsername !== username) {
      user.username = newUsername;
    }
    if (password) {
      user.password = await hash(password);
    }

    await user.save();

    ctx.response.body = { message: "User updated successfully" };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to update user" };
  }
};

export const registerUser = async (ctx: Context) => {
  await connect();
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

  try {
    const existing = await User.findOne({ where: { username } });
    if (existing) {
      ctx.response.status = 409;
      ctx.response.body = { error: "Username already exists." };
      return;
    }

    const hashedPassword = await hash(password);

    await User.create({
      username,
      password: hashedPassword,
      coins: 0,
      collection: null,
    });

    ctx.response.status = 201;
    ctx.response.body = { message: "User registered successfully", username };
  } catch (error) {
    console.error("Error en registerUser:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to register user." };
  }
};

export const loginUser = async (ctx: Context) => {
  await connect();
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

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid username or password" };
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      ctx.response.status = 401;
      ctx.response.body = { error: "Invalid username or password" };
      return;
    }

    ctx.response.body = { message: "Login successful", username };
  } catch (error) {
    ctx.response.status = 500;
    ctx.response.body = { error: "Failed to login" };
  }
};

export const getUserPlayers = async (ctx: Context) => {
  await connect();
  const username = ctx.params.username;

  try {
    const user = await User.findOne({
      where: { username },
      include: {
        model: Player,
        as: "players", // el alias definido en `belongsToMany`
        through: { attributes: [] }, // para no incluir info de la tabla intermedia
      },
    });

    if (!user) {
      ctx.response.status = 404;
      ctx.response.body = { error: "Usuario no encontrado" };
      return;
    }

    const players = user.players.map((p: any) => ({
      id: p.id,
      name: p.name,
      image:  `/api/players/${p.id}/image`,
    }));

    ctx.response.status = 200;
    ctx.response.body = players;
  } catch (error) {
    console.error("Error en getUserPlayers:", error);
    ctx.response.status = 500;
    ctx.response.body = { error: "Error al obtener las cartas del usuario" };
  }
};