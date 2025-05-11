import { Sequelize } from "npm:sequelize";

// TODO: import all the models
import * as users from "./user.ts";

// Initialize all the models at once with the sequelize instance
const initialize = (sequelize: Sequelize) => {
    users.initialize(sequelize);
}

export { initialize };