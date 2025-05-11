import { DataTypes, Model, Sequelize } from "npm:sequelize";

class User extends Model {
  declare username: string;
  declare password: string;
  declare coins: number;
  declare colection: string;
}

const initialize = (sequelize: Sequelize) => {
  User.init(
    {
      username: {
        type: DataTypes.STRING(10),
        primaryKey: true,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      coins: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      colection: {
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