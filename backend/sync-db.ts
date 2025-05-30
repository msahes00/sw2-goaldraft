import { connect } from "./controllers/db.ts";
import { initialize as initUser } from "./models/user.ts";
import { initialize as initPlayer } from "./models/player.ts";

const syncDatabase = async () => {
    const sequelize = await connect();
    initUser(sequelize);
    initPlayer(sequelize);

    // Elimina y recrea todas las tablas según los modelos
    await sequelize.sync({ force: true });
    console.log("Todas las tablas han sido eliminadas y recreadas según los modelos.");
};

syncDatabase();