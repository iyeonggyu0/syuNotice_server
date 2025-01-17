const express = require("express");
const router = express.Router();
const { decryptFun, encryptFun } = require("../util/crypto");
const { Sequelize, Op } = require("sequelize");
const fs = require("fs");
const axios = require("axios");
const qs = require("qs");
const FormData = require("form-data");
const https = require("https");
const cheerio = require("cheerio");

const { Notice, NoticeTag, UserTag, User, MsgData, MsgLog } = require("../models");

// 학사공지
// router.get("/read", async (req, res, next) => {
//   console.log("실행");

//   const today = moment();
//   const oneWeekAgo = today.clone().subtract(7, "days").set({ hour: 14, minute: 1, second: 0, millisecond: 0 });

//   // 학사공지
//   const url = "https://www.syu.ac.kr/academic/academic-notice/";
//   try {
//     const agent = new https.Agent({
//       rejectUnauthorized: false, // SSL 인증서 검증 비활성화
//     });

//     // axios를 사용하여 웹 페이지 요청
//     const { data } = await axios.get(url, { httpsAgent: agent });

//     // cheerio로 HTML 파싱
//     const $ = cheerio.load(data);

//     // table.md_notice_tbl 안에 있는 tbody의 모든 tr 태그 찾기
//     const rows = $("table.md_notice_tbl tbody tr");

//     // 각 tr에 대해서 필요한 데이터 추출
//     rows.each(async (index, row) => {
//       const type = $(row).find("td.step2 h3 a .md_cate").text().trim();
//       const title = $(row).find("td.step2 h3 a .tit").text().trim(); // 제목 텍스트
//       const date = $(row).find("td.step4").text().trim(); // 날짜

//       // 주어진 날짜 (예시: '2024.12.09')를 moment 객체로 변환
//       const givenDate = moment(date, "YYYY.MM.DD");

//       if (isBetween(oneWeekAgo, today)) {
//         await User.create({
//           notice_name: title,
//           notice_date: givenDate.toDate(),
//           // 학사
//           type: "학사",
//         });
//       }
//     });
//   } catch (error) {
//     console.error("Error fetching the HTML:", error);
//   }
// });

module.exports = router;
