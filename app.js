require("dotenv").config(); // .env 파일의 내용을 로드
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require("fs");
const PORT = process.env.PORT || 5000;
const applicationInsights = require("applicationinsights");

const userRouter = require("./routes/user");
// const noticeRouter = require("./routes/notice");
const adminRouter = require("./routes/admin");
const autoRouter = require("./routes/auto");
const logRouter = require("./routes/log");

const db = require("./models");

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
  origin: [
    "https://syunotice-frontend-server-dbajcghpdadrbect.koreacentral-01.azurewebsites.net",
    "https://syunotice.com",
    "https://www.syunotice.com",
    "syunotice-backend-server-djcph3a3c7dthyfh.koreacentral-01.azurewebsites.net",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use("/api/notice", noticeRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);
app.use("/api/log", logRouter);
app.use("/api/auto", autoRouter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} 요청 받음`);
  next();
});

app.use((err, req, res, next) => {
  console.error(`Error occurred: ${err.message}`);
  res.status(500).send("Internal Server Error");
});

// app.get("/", (req, res) => {
//   res.status(200).json({
//     status: "success",
//     message: "Express Server is Running",
//   });
// });

app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Express Server is Running",
    dbConfig: {
      URL_SCHOOL_NOTICE: process.env.URL_SCHOOL_NOTICE,
      URL_SCHOOL_SCHOLARSHIP: process.env.URL_SCHOOL_SCHOLARSHIP,
      URL_SCHOOL_EVENT: process.env.URL_SCHOOL_EVENT,
    },
  });
});

app.listen(PORT, () => {
  console.log(`${PORT}포트에서 서버 실행중...`);
});
