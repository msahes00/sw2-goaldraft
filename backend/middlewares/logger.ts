import { Context } from "@oak/oak/context";
import { Next } from "@oak/oak/middleware";

/*
 * Factory to log requests (with or without contents)
 */
const factory = (contents: boolean) => {

    /*
     * Middleware to log requests to the server
     */
    const logRequests = async (ctx: Context, next: Next) => {

        // Get the current server date
        const current_time = new Date();

        // Log a message to the console indicating:
        // [current_time_in_ISO_format] HTTP_method base_url/path_url
        console.log(`[${current_time.toISOString()}] (${ctx.request.ip}) ${ctx.request.method} ${ctx.request.url}`);

        // If it is not specified to log the request contents,
        // delegate to the next function
        if (!contents) return await next();

        // Log the headers
        console.log(ctx.request.headers);

        // If the method is POST or PUT, also log the body
        // of the message only if it follows the JSON data format
        const putPost = (ctx.request.method === "POST") || (ctx.request.method === "PUT");
        const json = ctx.request.headers.get("content-type") === "application/json";

        if (putPost && json) {
            const body = ctx.request.body.json();
            console.log(JSON.stringify(body));
        }

        // Delegate to the next function
        await next();
    };

    // Returns the logging function with the appropriate configuration
    return logRequests;
};


// Export the factory function
export default factory;