import { DataTypes, Model, Sequelize } from "npm:sequelize";

// Declare the models (here for type checking)
class Player extends Model {
  declare id: number;
  declare name: string;
  declare imageId: number;
  declare image: Uint8Array; // Equivalent to node:Buffer
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
      imageId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      } 
    },
    {
      sequelize: sequelize,
    },
  );
  
  // Define the relationships
  Player.belongsTo(PlayerImage, {
    foreignKey: "imageId",
    targetKey: "id",
    as: "image",
  });
  PlayerImage.hasOne(Player, {
    foreignKey: "imageId",
    sourceKey: "id",
    as: "player",
  });
};


// Export the Player model
export { Player, PlayerImage, initialize };