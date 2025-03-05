// Import dependencies
import { Client } from "https://deno.land/x/mysql@v2.11.0/mod.ts";

// Global variable for database connection
let client: Client | null = null;


/*
 * Connect to the database
 * Returns the database client if successful, null otherwise
 */
const connect = async () => {

  // Obtain the connection details from environment variables
  const dbPort = parseInt(Deno.env.get("DB_PORT") || "3306");
  const dbHost = Deno.env.get("DB_HOST") || "127.0.0.1";
  const dbUser = Deno.env.get("DB_USER") || "admin";
  const dbPass = Deno.env.get("DB_PASS") || "admin";
  const dbName = Deno.env.get("DB_NAME") || "db";
  
  // Create a new database client
  client = await new Client().connect({
    hostname: dbHost,
    username: dbUser,
    password: dbPass,
    db: dbName,
    port: dbPort,
  });

  // Check if the connection was successful
  const ok = await testConnection();
  if (!ok) {
    console.error("Database connection failed");

    // Close the connection and clear the client
    await client.close();
    client = null;
  }
  
  console.log("Database connection successful");
  return client;
};


/*
 * Disconnect from the database
 * Returns true if it was successful, false otherwise
 */
const disconnect = async () => {
  // Ignore if the client is not connected
  if (!client) return false;

  // Close the connection and clear the client
  await client.close();
  client = null;

  console.log("Database connection closed");
  return true;
};


/*
 * Get the current connection status as an object
 */
const status = async () => {

  // Check if the connection is working
  const ok = await testConnection();

  return {
    state: ok ? "connected" : "disconnected"
  }
};


/*
 * Test the database connection
 * Returns true if the connection is working, false otherwise
 */
const testConnection = async () => {

  try {
    // Execute a simple query to test the connection
    await client?.execute("SELECT 1");
    return true;

  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
};

// Export functions
export { connect, disconnect, status };
