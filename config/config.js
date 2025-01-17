require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME, // .env에서 불러오기
    password: process.env.DB_PASSWORD, // .env에서 불러오기
    database: process.env.DB_DATABASE, // .env에서 불러오기
    host: process.env.DB_HOST, // .env에서 불러오기
    dialect: process.env.DB_DIALECT, // .env에서 불러오기 (예: 'mysql', 'postgres', 등)
    logging: console.log, // 쿼리 로깅 (필요에 따라 true/false 설정)
    timezone: "+09:00",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    logging: false, // production 환경에서는 쿼리 로깅을 끄는 것이 일반적
    timezone: "+09:00",
  },
};
