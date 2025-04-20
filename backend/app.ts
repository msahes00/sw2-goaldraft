import { Application } from "jsr:@oak/oak/application";
import { config } from "npm:dotenv";

import * as lt from "./controllers/localtunnel.ts";
import * as db from "./controllers/db.ts";

import logger from "./middlewares/logger.ts";
import * as models from "./models/mod.ts"

import root from "./routes/root.ts";


// Load environment variables from .env file
config();

// Get the app port and the log level from environment variables
const PORT = parseInt(Deno.env.get("PORT") || "3000");
const LOG_LEVEL = !!Deno.env.get("LOG_LEVEL");

// Create the Oak application and add the root router and the logger
const app = new Application();

app.use(logger(LOG_LEVEL));
app.use(root.routes(), root.allowedMethods());


// Main program entry point
if (import.meta.main) {

  // Connect to the database, exiting if it fails
  const connection = await db.connect();
  if (!connection) Deno.exit(1);

  // Initalize all the models and sync them with the database
  models.initialize(connection);
  await connection.sync();

  // Add a callback to run as soon as the server starts
  app.addEventListener("listen", ({ hostname, port, secure }) => {

    // Prepare the potocol and the hostname and print it
    const proto = `${secure ? "https://" : "http://"}`;
    const host  = `${hostname ?? "localhost"}`;

    console.log(`Server listening on: ${proto}${host}:${port}`);

    // Start the HTTPS tunnel
    lt.connect(PORT);
  });

  // Start the server
  await app.listen({ port: PORT });
}

// Export the app for testing
export default app;