import { Sequelize } from "npm:sequelize";

// Importar los modelos y funciones
import { User, UserPlayer, initialize as initializeUser, defineUserAssociations } from "./user.ts";
import { Player, initialize as initializePlayer } from "./player.ts";

// Inicializar todos los modelos
const initialize = (sequelize: Sequelize) => {
    initializeUser(sequelize);
    initializePlayer(sequelize);
    defineUserAssociations(Player); //De momento necesario para las imagenes
};

// Exportamos
export { User, Player, UserPlayer, initialize };