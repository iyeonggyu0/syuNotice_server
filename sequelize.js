// sequelize.js
const { Sequelize } = require("sequelize");
require("dotenv").config();
const config = require("./config/config"); // config.js 파일 불러오기

// 환경에 맞는 설정 선택
const sequelize = new Sequelize(config.development); // 개발 환경

// 연결 확인
sequelize
  .authenticate()
  .then(() => {
    console.log("Database connected successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });

module.exports = sequelize;
