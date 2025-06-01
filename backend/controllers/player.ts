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
    // @ts-ignore
    const id = ctx?.params?.id;
    if (!id) throw new Error("Player ID is required");

    // Buscar imagen en la base de datos
    const playerImage = await PlayerImage.findOne({ where: { id } });

    let image: Buffer;

    if (playerImage) {
      image = playerImage.image;
      console.log(`Imagen para jugador ${id} obtenida desde la base de datos.`);
    } else {
      // Si no existe en la base de datos, se consulta directamente a la API
      console.log(`Imagen para jugador ${id} no encontrada en DB. Solicitando a la API...`);
      image = await fetchPlayerImage(Number(id));
    }

    // Setear respuesta
    ctx.response.status = 200;
    ctx.response.headers.set("Content-Type", "image/png");
    ctx.response.headers.set("Content-Length", image.length.toString());
    ctx.response.body = image;

  } catch (error) {
    console.error("Error en getPlayerImage:", error);
    ctx.response.status = 500;
    ctx.response.body = {
      message: error instanceof Error ? error.message : "Unknown error"
    };
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
 * Returns a random set of players from a given position.
 */

const getRandomPlayersByPosition = async (ctx: Context) => {
  const position = ctx.params?.position?.toUpperCase();
  const count = 5;

  if (!position || !staticPlayerIdsByPosition[position]) {
    ctx.response.status = 400;
    ctx.response.body = { message: "Posición inválida" };
    return;
  }

  try {
    const randomIds = getRandomUniqueItems(staticPlayerIdsByPosition[position], count);
    const players = await Promise.all(randomIds.map(fetchPlayer));

    ctx.response.status = 200;
    ctx.response.body = players;
  } catch (error) {
    console.error("Error al obtener jugadores:", error);
    ctx.response.status = 500;
    ctx.response.body = { message: "Error al obtener jugadores" };
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

/*
 * A helper function to get a random set of unique items from an array.
 */

function getRandomUniqueItems<T>(array: T[], count: number): T[] {
  const copy = [...array];
  const result: T[] = [];
  const max = Math.min(count, copy.length);

  for (let i = 0; i < max; i++) {
    const idx = Math.floor(Math.random() * copy.length);
    result.push(copy[idx]);
    copy.splice(idx, 1)
  }
  return result;
}

const staticPlayerIdsByPosition: Record<string, number[]> = {
  GK: [33, 61, 83, 84, 85, 129, 139, 141, 190, 193, 522],
  LB: [30, 88, 112, 124, 135, 142, 152, 218, 284, 483],
  CB: [11, 13, 15, 121, 122, 123, 162, 485, 487, 2243],
  RB: [10, 20, 28, 67, 185, 187, 256, 266, 274, 393],
  CM: [3, 4, 7, 8, 43, 44, 98, 100, 382, 523],
  LW: [26, 90, 101, 109, 110, 126, 237, 244, 255, 383],
  RW: [5, 34, 87, 91, 92, 188, 245, 325, 329, 521],
  ST: [1, 2, 6, 42, 47, 50, 86, 324, 338, 340, 524],
};

// Export the functions
export { getAll, getPlayer, getPlayerImage, importPlayer, search, getRandomPlayersByPosition};