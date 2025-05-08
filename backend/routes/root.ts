import { Router } from "jsr:@oak/oak/router";

import frontend from "./frontend.ts";
import system from "./system.ts";
import users from "./users.ts";

// Prepare the root router
const router = new Router();

// TODO: Add the rest of the routers here
router.use(users.routes(), users.allowedMethods());
router.use("/system", system.routes(), system.allowedMethods());
router.use(frontend.routes(), frontend.allowedMethods());


// Export the router
export default router;