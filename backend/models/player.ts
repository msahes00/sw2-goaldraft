import { DataTypes, Model, Sequelize } from "npm:sequelize";

// Declare the models (here for type checking)
class Player extends Model {
    declare id: number;
    declare name: string;
    declare image: Uint8Array;
}

const initialize = (sequelize: Sequelize) => {
    Player.init(
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            image: {
                type: DataTypes.BLOB("long"),
                allowNull: false,
            },
        },
        {
            sequelize,
            tableName: "players",
        },
    );
};

export { Player, initialize };