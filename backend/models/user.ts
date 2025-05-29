import { DataTypes, Model, Sequelize } from "npm:sequelize";

class User extends Model {
  declare id: number;
  declare username: string;
  declare password: string;
  declare coins: number;
  declare collection: string;
}

const initialize = (sequelize: Sequelize) => {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(10),
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      coins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      collection: {
        type: DataTypes.STRING(150),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "users",
    }
  );
};

export { User, initialize };