// Import dependencies
import localtunnel from "npm:localtunnel";
import { Tunnel } from "npm:localtunnel";

// Some global variables
let tunnel: Tunnel | null = null;
let password: string | null = null;
let port = 3000;
let enabled = false;

/*
 * Connect to the localtunnel service
 * Returns true if the connection was successful, false otherwise
 */
const connect = async (portNumber?: number) => {

  // Save the port number if provided
  if (portNumber) port = portNumber;

  // Check if the service is enabled
  enabled = !!Deno.env.get("LOCALTUNNEL_ENABLED");

  // Return if already connected or the service is disabled
  if (isConnected() || !enabled)
    return isConnected();

  // Create the tunnel
  tunnel = await localtunnel({
    port: port,
    subdomain: Deno.env.get("LOCALTUNNEL_SUBDOMAIN"),
  });

  // Add some hooks to log the tunnel status
  tunnel.on("close", () => console.log("Localtunnel closed"));
  tunnel.on("error", (err: unknown) => console.error(`Localtunnel error: ${err}`));

  // Add some hooks to gracefully close the tunnel
  registerDisconnect();

  // Print the tunnel URL
  console.log(`HTTPS tunnel is running on ${tunnel.url}`);
    
  // Get the password required by localtunnel
  await fetch("https://loca.lt/mytunnelpassword")
    .then(async (res) => {
      password = await res.text();
      console.log(`Localtunnel password: ${password}`);
    }).catch((err) => console.error("Failed to fetch password:", err));
    
  // Return the tunnel status
  return isConnected();
};

/*
 * Disconnect from the localtunnel service
 * Returns true if it was successful, false otherwise
 */
const disconnect = () => {
  // Bypass if the tunnel is not connected
  if (!isConnected()) return false;

  // Close the tunnel and reset it
  tunnel.close();
  tunnel = null;

  return true;
};

/*
 * Get the current connection status as an object
 */
const status = () => {

  // Return the status information
  return {
    url: tunnel ? tunnel.url : null,
    status: isConnected() ? "connected" : "disconnected",
    password: password,
    enabled: enabled,
  };
};

/*
 * Register some hooks to gracefully disconnect the tunnel on exit
 */
const registerDisconnect = () => {

  const handler = () => {
    disconnect();
    Deno.exit();
  };

  // Disconnect the tunnel on exit
  Deno.addSignalListener("SIGINT", handler);
  Deno.addSignalListener("SIGTERM", handler);
  Deno.addSignalListener("SIGUSR1", handler);
  Deno.addSignalListener("SIGUSR2", handler);
}


/*
 * A helper to get the current tunnel status
 */
const isConnected = () => {
  return !!tunnel && !tunnel.closed;
};

// Export functions for use in other modules
export { connect, disconnect, status };
