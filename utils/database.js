const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("shop-app", "root", "ILeMyFy&1998**", {
  host: "localhost",
  dialect: "mysql",
});

module.exports = sequelize;
