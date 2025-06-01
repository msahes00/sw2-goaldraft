// Import dependencies
import { Context } from "@oak/oak/context";
import { Buffer } from "node:buffer";

import { Player, PlayerImage } from "../models/player.ts";

// Get the token to access the API
const getToken = () => Deno.env.get("FUTAPI_TOKEN") || "";

/*
 * Returns all the players
 */
const getAll = async (ctx: Context) => {


  try {
    // Get all the cards
    const players = await Player.findAll();

    // And return them
    ctx.response.status = 200;
    ctx.response.body = players;

  } catch(error) {
    console.error(error);
    ctx.response.status = 500;

    // Return the error message if any
    if (error instanceof Error) {
      ctx.response.body = { message: error.message };
    }
  }
};

/*
 * Return the player information
 */
const getPlayer = async (ctx: Context) => {
  try {
    // Get the player id to fetch
    // @ts-ignore: ctx.params.id will be defined when the route is called
    const id = ctx?.params?.id;
    if (!id) throw new Error("Player ID is required");

    // Fetch the player data from the database
    const player = await Player.findOne({ where: { id } });
    if (!player) throw new Error("Player not found");

    // Return the player information
    ctx.response.status = 200;
    ctx.response.body = player;

  } catch(error) {
    console.error(error);
    ctx.response.status = 500;

    // Return the error message if any
    if (error instanceof Error) {
      ctx.response.body = { message: error.message };
    }
  }
};

/*
 * Get the player image
 */
const getPlayerImage = async (ctx: Context) => {
  try {
    // Get the player id to fetch
    // @ts-ignore: ctx.params.id will be defined when the route is called
    const id = ctx?.params?.id;
    if (!id) throw new Error("Player ID is required");

    // Fetch the player image from the database
    const playerImage = await PlayerImage.findOne({ where: { id } });
    if (!playerImage) throw new Error("Player image not found");

    const image = playerImage.image;

    // Set the code and the headers
    ctx.response.status = 200;
    ctx.response.headers.set("Content-Type", "image/png");
    ctx.response.headers.set("Content-Length", image.length.toString());

    // Set the response body to the image
    ctx.response.body = image;

  } catch(error) {
    console.error(error);
    ctx.response.status = 500;

    // Return the error message if any
    if (error instanceof Error) {
      ctx.response.body = { message: error.message };
    }
  }
};


/*
 * Fetch the specified player into the database
 */
const importPlayer = async (ctx: Context) => {
  try {
    // Get the player id to fetch
    // @ts-ignore: ctx.params.id will be defined when the route is called
    const id = ctx?.params?.id;
    if (!id) throw new Error("Player ID is required");

    // Check if it will be forced to fetch the player
    // Mostly here to avoid using the API quota
    const force = ctx.request.url.searchParams.get("force") === "true";
    const stored = await Player.findOne({ where: { id } });

    if (stored && !force) {
      ctx.response.status = 200;
      ctx.response.body = stored;
      return;
    }

    // Fetch the player info from the API
    const player = await fetchPlayer(id);
    const image = await fetchPlayerImage(id);

    // Create or update the player and image in the database
    // NOTE: The image id is the same as the player id
    await PlayerImage.upsert({ id: player.id, image }); 
    const data = await Player.upsert({ 
      ...player, 
      imageId: player.id,
      position: player.position
    });

    // Return the player information
    ctx.response.status = 200;
    ctx.response.body = data[0]; // [0] is to return the player object

  } catch(error) {
    console.error(error);
    ctx.response.status = 500;

    // Return the error message if any
    if (error instanceof Error) {
      ctx.response.body = { message: error.message };
    }
  }
};

/*
 * Search for players based on count and randomness
 */
const search = async (ctx: Context) => {
  try {
    const body = await ctx.request.body.json();
    const count = body.count;
    const random = body.random;

    // Remove count and random from the body to use the rest as search criteria
    delete body.count;
    delete body.random;

    // Prepare the options passed to Sequelize and the result variable
    const options = { where: body };
    let players;

    // Handle random search
    if (random) {
      const allPlayers = await Player.findAll(options);

      // Shuffle the players and take the first count
      players = allPlayers
        .sort(() => 0.5 - Math.random())
        .slice(0, count);
    
    } else { 
      // Otherwise just pass the limit to Sequelize directly
      players = await Player.findAll({ ...options, limit: count });
    }

    // Finally return the results
    ctx.response.status = 200;
    ctx.response.body = players;

  } catch (error) {
    console.error(error);
    ctx.response.status = 500;

    // Return the error message if any
    if (error instanceof Error) {
      ctx.response.body = { message: error.message };
    }
  }
};

/*
 * A helper function to fetch the player information
 */
const fetchPlayer = async (id: number) => {

  // Fetch the player info from the API
  const response = await fetch(`https://api.futdatabase.com/api/players/${id}`, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "X-AUTH-TOKEN": getToken(),
    },
  });

  // Check if the response is ok
  if (!response.ok) {
    throw new Error("Failed to fetch player information: " + response.statusText);
  }

  // Get the player information as JSON
  const info = await response.json();

  // Return the player information
  return info.player;
};

/*
 * A helper function to fetch the player image
 * Will return the image 
 */
const fetchPlayerImage = async (id: number) => {

  // Fetch the player image from the API
  const response = await fetch(`https://api.futdatabase.com/api/players/${id}/image`, {
    method: "GET",
    headers: {
      "accept": "application/json",
      "X-AUTH-TOKEN": getToken(),
    },
  });

  // Check if the response is ok
  if (!response.ok) {
    throw new Error("Failed to fetch player image: " + response.statusText);
  }

  // Return the player image as a Uint8Array
  return Buffer.from(await response.arrayBuffer());
};


// Export the functions
export { getAll, getPlayer, getPlayerImage, importPlayer, search };