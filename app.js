const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const https = require("https");
const fs = require("fs");
// const mySqlStore = require("express-mysql-session")(session);
const PORT = process.env.PORT || 5000;
const applicationInsights = require("applicationinsights");

const userRouter = require("./routes/user");
// const noticeRouter = require("./routes/notice");
const adminRouter = require("./routes/admin");
const autoRouter = require("./routes/auto");

const db = require("./models");

dotenv.config();
const app = express();
db.sequelize
  .sync()
  .then(() => {
    console.log("#################\n## DB 연결성공 ##\n#################");
  })
  .catch(console.error);

// cors error
// 3030, 3000 ---> 3030 에러

// Azure Application Insights 설정
applicationInsights
  .setup(process.env.APPLICATION_INSIGHTS_KEY) // 애저의 Instrumentation Key를 환경 변수로 설정해야 함
  .setAutoCollectRequests(true) // 요청 자동 수집
  .setAutoCollectDependencies(true) // 외부 의존성 자동 수집
  .setAutoCollectPerformance(true) // 성능 모니터링
  .setAutoCollectExceptions(true) // 예외 자동 수집
  .setAutoCollectConsole(true) // 콘솔 로그 자동 수집
  .start();

const corsOptions = {
  origin: process.env.CLIENT_URL, // 클라이언트 출처 설정
  methods: ["GET", "POST", "PUT", "DELETE"], // 허용할 HTTP 메서드 설정
  allowedHeaders: ["Content-Type"], // 허용할 요청 헤더 설정
  credentials: true, // 쿠키와 자격 증명 허용
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api/notice", noticeRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
// 주석
app.use("/api/auto", autoRouter);

app.listen(PORT, () => {
  console.log(`${PORT}포트에서 서버 실행중...`);
});
