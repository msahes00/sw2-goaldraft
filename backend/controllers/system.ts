// Import dependencies
import * as tunnel from "./localtunnel.ts";
import * as db from "./db.ts";

/*
 * Reload the server
 * Just shuts down the server gracefully
 * On docker, the container will automatically restart
 */
const reload = () => {
  console.log("Reloading server");
  Deno.exit(0);
};

/*
 * Get the current status of the server
 */
const status = async () => {
  return {
    db: await db.status(),
    tunnel: tunnel.status(),
  };
};

// Export functions
export { reload, status };
