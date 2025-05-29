// Import dependencies
import { Sequelize } from "npm:sequelize";
import "https://deno.land/x/dotenv/load.ts";

let instance: Sequelize | null = null;

/*
 * Connect to the database
 * Returns the Sequelize instance if successful, null otherwise
 */
const connect = async () => {

  // Bypass if already connected
  if (instance) return instance;

  // Obtain the connection URI from the environment variables
  const dbPort = parseInt(Deno.env.get("DB_PORT") || "3306");
  const dbHost = Deno.env.get("DB_HOST") || "127.0.0.1";
  const dbUser = Deno.env.get("DB_USER") || "admin";
  const dbPass = Deno.env.get("DB_PASS") || "admin";
  const dbName = Deno.env.get("DB_NAME") || "db";
  const dbUri = `mysql://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}`;

  // Create a new Sequelize instance
  const sequelize = new Sequelize(dbUri, { dialect: "mysql" });

  try {
    // Test the connection
    await sequelize.authenticate();
    console.log("Sequelize connected to the database.");
    
    // Store the instance and return it
    instance = sequelize;
    return sequelize;

  } catch (error) {

    // Log the error and fail
    console.error("Sequelize connection error:", error);

    await sequelize.close();
    return null;
  }
};

/*
 * Disconnect from the database
 * Returns true if it was successful, false otherwise
 */
const disconnect = async () => {
  // Ignore if the instance is not connected
  if (!instance) return false;

  // Close the connection and clear the instance
  await instance.close();
  instance = null;

  console.log("Sequelize connection closed");
  return true;
}

/*
 * Get the current connection status as an object
 */
const status = () => {
  return {
    state: instance ? "connected" : "disconnected",
  };
};

// Export the functions
export { connect, disconnect, status };