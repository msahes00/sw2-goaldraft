import { Context } from "@oak/oak/context";
import { Buffer } from "node:buffer";
import { Player } from "../models/player.ts";

// Get the token to access the API
const getToken = () => Deno.env.get("FUTAPI_TOKEN") || "";

/*
 * Returns all the players
 */
const getAll = async (ctx: Context) => {
  try {
    const players = await Player.findAll();
    ctx.response.status = 200;
    ctx.response.body = players;
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { message: error instanceof Error ? error.message : "Unknown error" };
  }
};

/*
 * Return the player information
 */
const getPlayer = async (ctx: Context) => {
  try {
    const id = ctx?.params?.id;
    if (!id) throw new Error("Player ID is required");

    const player = await Player.findOne({ where: { id } });
    if (!player) throw new Error("Player not found");

    ctx.response.status = 200;
    ctx.response.body = player;
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { message: error instanceof Error ? error.message : "Unknown error" };
  }
};

/*
 * Get the player image
 */
const getPlayerImage = async (ctx: Context) => {
  try {
    const id = ctx?.params?.id;
    if (!id) throw new Error("Player ID is required");

    const player = await Player.findOne({ where: { id } });
    if (!player || !player.image) throw new Error("Player image not found");

    ctx.response.status = 200;
    ctx.response.headers.set("Content-Type", "image/png");
    ctx.response.headers.set("Content-Length", player.image.length.toString());
    ctx.response.body = player.image;
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { message: error instanceof Error ? error.message : "Unknown error" };
  }
};

/*
 * Fetch the specified player into the database
 */
const importPlayer = async (ctx: Context) => {
  try {
    const id = ctx?.params?.id;
    if (!id) throw new Error("Player ID is required");

    const force = ctx.request.url.searchParams.get("force") === "true";
    const stored = await Player.findOne({ where: { id } });

    if (stored && !force) {
      ctx.response.status = 200;
      ctx.response.body = stored;
      return;
    }

    const player = await fetchPlayer(Number(id));
    const image = await fetchPlayerImage(Number(id));

    const data = await Player.upsert({ ...player, image });

    ctx.response.status = 200;
    ctx.response.body = data[0];
  } catch (error) {
    console.error(error);
    ctx.response.status = 500;
    ctx.response.body = { message: error instanceof Error ? error.message : "Unknown error" };
  }
};

/*
 * Helper to fetch player info from the external API
 */
const fetchPlayer = async (id: number) => {
  const response = await fetch(`https://api.futdatabase.com/api/players/${id}`, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "X-AUTH-TOKEN": getToken(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch player information: " + response.statusText);
  }

  const info = await response.json();
  return info.player;
};

/*
 * Helper to fetch player image from the external API
 */
const fetchPlayerImage = async (id: number): Promise<Uint8Array> => {
  const response = await fetch(`https://api.futdatabase.com/api/players/${id}/image`, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "X-AUTH-TOKEN": getToken(),
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch player image: " + response.statusText);
  }

  return Buffer.from(await response.arrayBuffer());
};

// Export the functions
export { getAll, getPlayer, getPlayerImage, importPlayer };
