import { Sequelize } from "npm:sequelize";

// TODO: import all the models
import * as users from "./user.ts";
import * as players from "./player.ts";

// Initialize all the models at once with the sequelize instance
const initialize = (sequelize: Sequelize) => {
    users.initialize(sequelize);
    players.initialize(sequelize);
}

export { initialize };