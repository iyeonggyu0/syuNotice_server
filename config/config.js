module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: console.log, // 개발 환경에서는 쿼리 로그를 활성화
    timezone: "+09:00",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true, // SSL/TLS 연결 강제
        rejectUnauthorized: true, // 인증되지 않은 인증서 거부 (권장)
        // ca: fs.readFileSync('./BaltimoreCyberTrustRoot.crt.pem') // 필요한 경우 CA 인증서 경로 지정
      },
    },
    logging: false, // 배포 환경에서는 쿼리 로그를 비활성화
    timezone: "+09:00",
  },
};
