import { Application } from "jsr:@oak/oak/application";
import { config } from "npm:dotenv";

import * as lt from "./controllers/localtunnel.ts";
import * as db from "./controllers/db.ts";

import root from "./routes/root.ts";


// Load environment variables from .env file
config();

// Get the app port from environment variables
const PORT = parseInt(Deno.env.get("PORT") || "3000");

// Create the Oak application and add the root router
const app = new Application();
app.use(root.routes());
app.use(root.allowedMethods());


// Main program entry point
if (import.meta.main) {

  // Connect to the database, exiting if it fails
  if (!await db.connect()) Deno.exit(1);

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