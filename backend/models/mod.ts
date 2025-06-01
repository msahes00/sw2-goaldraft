import { Sequelize } from "npm:sequelize";

// Importar los modelos y funciones
import * as User from "./user.ts";
import * as Player from "./player.ts";

// Inicializar todos los modelos
const initialize = async (sequelize: Sequelize) => {
  Player.initialize(sequelize);
  User.initialize(sequelize);

  await sequelize.sync();
};

export { initialize };
