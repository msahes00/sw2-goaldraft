import { DataTypes, Model, Sequelize } from "npm:sequelize";
import { Player } from "./player.ts";

class User extends Model {
  declare id: number;
  declare username: string;
  declare password: string;
  declare coins: number;
  declare players: Player;
}

class UserPlayer extends Model {
  declare userId: number;
  declare playerId: number;
}

const initialize = (sequelize: Sequelize) => {
  User.init({
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    username: { type: DataTypes.STRING(10), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(100), allowNull: false },
    coins: { type: DataTypes.INTEGER, defaultValue: 0 },
  }, {
    sequelize,
  });

  UserPlayer.init({
    userId: { type: DataTypes.INTEGER, allowNull: false },
    playerId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    sequelize,
  });

  User.belongsToMany(Player, {
    through: UserPlayer,
    foreignKey: "userId",
    otherKey: "playerId",
    as: "players",
  });

  Player.belongsToMany(User, {
    through: UserPlayer,
    foreignKey: "playerId",
    otherKey: "userId",
    as: "users",
  });
};

export { initialize, User, UserPlayer };
