require("dotenv").config();
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
process.env.conncetion_string,
{
  dialect: "postgres",

  protocol: "postgres",

  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  },

  logging: false
}
);
module.exports = sequelize;
