import { DataTypes, Model, Sequelize } from "npm:sequelize";

// Declare the models (here for type checking)
class Player extends Model {
  declare id: number;
  declare name: string;
  declare rarity: number;
  declare imageId: number;
  declare image: Uint8Array; // Equivalent to node:Buffer
  declare position: string;
}

class PlayerImage extends Model {
  declare id: number;
  declare image: Uint8Array; // Equivalent to node:Buffer
}

// Initialize the models
const initialize = (sequelize: Sequelize) => {
  PlayerImage.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      image: {
        type: DataTypes.BLOB("long"),
        allowNull: false,
      },
    },
    {
      sequelize: sequelize,
    },
  );

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
      rarity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      imageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      position: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize: sequelize,
    },
  );

  // Define the relationships
  PlayerImage.hasOne(Player, {
    foreignKey: "imageId",
    sourceKey: "id",
    as: "player",
  });
  Player.belongsTo(PlayerImage, {
    foreignKey: "imageId",
    targetKey: "id",
    as: "image",
  });
};

// Export the Player model
export { initialize, Player, PlayerImage };
