const cron = require("node-cron");
const https = require("https");
const axios = require("axios");
const cheerio = require("cheerio"); // cheerio 추가
const { Op } = require("sequelize");
const moment = require("moment");
const FormData = require("form-data");

const express = require("express");
const router = express.Router();

const { Notice, NoticeTag, User, UserTag, ServerLog } = require("../models");

// 매주 금요일 오후 2시에 실행되는 작업
cron.schedule("0 5 * * 5", async (next) => {
  // router.get("/road", async (req, res, next) => {
  console.log("실행");
  await ServerLog.create({
    detail: "정규 작업 시작",
  });

  const today = moment();
  const oneWeekAgo = today.clone().subtract(7, "days").set({ hour: 14, minute: 1, second: 0, millisecond: 0 });

  const url = process.env.URL_SCHOOL_NOTICE;

  const tagData = await UserTag.findAll({
    attributes: ["id", "tag"],
    where: { type: "" },
  });

  try {
    const agent = new https.Agent({
      rejectUnauthorized: false, // SSL 인증서 검증 비활성화
    });

    // axios를 사용하여 웹 페이지 요청
    const { data } = await axios.get(url, { httpsAgent: agent });

    // cheerio로 HTML 파싱
    const $ = cheerio.load(data);

    // table.md_notice_tbl 안에 있는 tbody의 모든 tr 태그 찾기
    const rows = $("table.md_notice_tbl tbody tr");

    // 각 tr에 대해서 필요한 데이터 추출
    for (const row of rows) {
      const type = $(row).find("td.step2 h3 a .md_cate").text().trim();
      const title = $(row).find("td.step2 h3 a .tit").text().trim(); // 제목 텍스트
      const date = $(row).find("td.step4").text().trim(); // 날짜

      const givenDate = moment(date, "YYYY.MM.DD");

      if (givenDate.isBetween(oneWeekAgo, today)) {
        const createData = await Notice.create({
          notice_name: title,
          notice_date: givenDate.toDate(),
          type: type === "" ? "학사" : type === "수업" || type === "학적" || type === "등록" || type === "채플" ? type : "학사",
        });

        // 태그 검사 및 NoticeTag 생성
        for (const tagObj of tagData) {
          if (title.includes(tagObj.tag)) {
            await NoticeTag.create({
              notice_id: createData.notice_id, // 생성된 Notice의 ID 사용
              userTag_id: tagObj.id,
            });
          }
        }
      }
    }
  } catch (error) {
    // 에러 발생 시 로그 생성
    await ServerLog.create({
      detail: "학사공지 정규 작업 중 서버 오류",
      log: JSON.stringify(error),
    });
    console.error("Error:", error.message);
    next(error); // Express 에러 핸들러로 넘기기
  }

  //
  //
  //
  // 학사공지2
  try {
    const url = `${process.env.URL_SCHOOL_NOTICE}page/2/`;

    const agent = new https.Agent({
      rejectUnauthorized: false, // SSL 인증서 검증 비활성화
    });

    // axios를 사용하여 웹 페이지 요청
    const { data } = await axios.get(url, { httpsAgent: agent });

    // cheerio로 HTML 파싱
    const $ = cheerio.load(data);

    // table.md_notice_tbl 안에 있는 tbody의 모든 tr 태그 찾기
    const rows = $("table.md_notice_tbl tbody tr");

    // 각 tr에 대해서 필요한 데이터 추출
    for (const row of rows) {
      const type = $(row).find("td.step2 h3 a .md_cate").text().trim();
      const title = $(row).find("td.step2 h3 a .tit").text().trim(); // 제목 텍스트
      const date = $(row).find("td.step4").text().trim(); // 날짜

      const givenDate = moment(date, "YYYY.MM.DD");

      if (givenDate.isBetween(oneWeekAgo, today)) {
        const createData = await Notice.create({
          notice_name: title,
          notice_date: givenDate.toDate(),
          type: type === "" ? "학사" : type === "수업" || type === "학적" || type === "등록" || type === "채플" ? type : "학사",
        });

        // 태그 검사 및 NoticeTag 생성
        for (const tagObj of tagData) {
          if (title.includes(tagObj.tag)) {
            await NoticeTag.create({
              notice_id: createData.notice_id, // 생성된 Notice의 ID 사용
              userTag_id: tagObj.id,
            });
          }
        }
      }
    }
  } catch (error) {
    // 에러 발생 시 로그 생성
    await ServerLog.create({
      detail: "학사공지 정규 작업 중 서버 오류",
      log: JSON.stringify(error),
    });
    console.error("Error:", error.message);
    next(error); // Express 에러 핸들러로 넘기기
  }

  //
  //
  //
  //
  // 장학공지
  const url2 = process.env.URL_SCHOOL_SCHOLARSHIP;

  try {
    const agent = new https.Agent({
      rejectUnauthorized: false, // SSL 인증서 검증 비활성화
    });

    // axios를 사용하여 웹 페이지 요청
    const { data } = await axios.get(url2, { httpsAgent: agent });

    // cheerio로 HTML 파싱
    const $ = cheerio.load(data);

    // table.md_notice_tbl 안에 있는 tbody의 모든 tr 태그 찾기
    const rows = $("table.md_notice_tbl tbody tr");

    // 각 tr에 대해서 필요한 데이터 추출
    for (const row of rows) {
      const type = $(row).find("td.step2 h3 a .md_cate").text().trim();
      const title = $(row).find("td.step2 h3 a .tit").text().trim(); // 제목 텍스트
      const date = $(row).find("td.step4").text().trim(); // 날짜

      const givenDate = moment(date, "YYYY.MM.DD");

      if (givenDate.isBetween(oneWeekAgo, today)) {
        const createData = await Notice.create({
          notice_name: title,
          notice_date: givenDate.toDate(),
          type: "장학",
        });

        // 태그 검사 및 NoticeTag 생성
        for (const tagObj of tagData) {
          if (title.includes(tagObj.tag)) {
            await NoticeTag.create({
              notice_id: createData.notice_id, // 생성된 Notice의 ID 사용
              userTag_id: tagObj.id,
            });
          }
        }
      }
    }
  } catch (error) {
    // 에러 발생 시 로그 생성
    await ServerLog.create({
      detail: "장학공지 정규 작업 중 서버 오류",
      log: JSON.stringify(error),
    });
    console.error("Error:", error.message);
    next(error); // Express 에러 핸들러로 넘기기
  }

  //
  //
  //
  //
  // 장학공지
  const url2_2 = `${process.env.URL_SCHOOL_SCHOLARSHIP}page/2/`;

  try {
    const agent = new https.Agent({
      rejectUnauthorized: false, // SSL 인증서 검증 비활성화
    });

    // axios를 사용하여 웹 페이지 요청
    const { data } = await axios.get(url2_2, { httpsAgent: agent });

    // cheerio로 HTML 파싱
    const $ = cheerio.load(data);

    // table.md_notice_tbl 안에 있는 tbody의 모든 tr 태그 찾기
    const rows = $("table.md_notice_tbl tbody tr");

    // 각 tr에 대해서 필요한 데이터 추출
    for (const row of rows) {
      const type = $(row).find("td.step2 h3 a .md_cate").text().trim();
      const title = $(row).find("td.step2 h3 a .tit").text().trim(); // 제목 텍스트
      const date = $(row).find("td.step4").text().trim(); // 날짜

      const givenDate = moment(date, "YYYY.MM.DD");

      if (givenDate.isBetween(oneWeekAgo, today)) {
        const createData = await Notice.create({
          notice_name: title,
          notice_date: givenDate.toDate(),
          type: "장학",
        });

        // 태그 검사 및 NoticeTag 생성
        for (const tagObj of tagData) {
          if (title.includes(tagObj.tag)) {
            await NoticeTag.create({
              notice_id: createData.notice_id, // 생성된 Notice의 ID 사용
              userTag_id: tagObj.id,
            });
          }
        }
      }
    }
  } catch (error) {
    // 에러 발생 시 로그 생성
    await ServerLog.create({
      detail: "장학공지 정규 작업 중 서버 오류",
      log: JSON.stringify(error),
    });
    console.error("Error:", error.message);
    next(error); // Express 에러 핸들러로 넘기기
  }

  //
  //
  //
  //
  // 행사공지
  const url3 = process.env.URL_SCHOOL_EVENT;

  try {
    const agent = new https.Agent({
      rejectUnauthorized: false, // SSL 인증서 검증 비활성화
    });

    // axios를 사용하여 웹 페이지 요청
    const { data } = await axios.get(url3, { httpsAgent: agent });

    // cheerio로 HTML 파싱
    const $ = cheerio.load(data);

    // table.md_notice_tbl 안에 있는 tbody의 모든 tr 태그 찾기
    const rows = $("table.md_notice_tbl tbody tr");

    // 각 tr에 대해서 필요한 데이터 추출
    for (const row of rows) {
      const type = $(row).find("td.step2 h3 a .md_cate").text().trim();
      const title = $(row).find("td.step2 h3 a .tit").text().trim(); // 제목 텍스트
      const date = $(row).find("td.step4").text().trim(); // 날짜

      const givenDate = moment(date, "YYYY.MM.DD");

      if (givenDate.isBetween(oneWeekAgo, today)) {
        const createData = await Notice.create({
          notice_name: title,
          notice_date: givenDate.toDate(),
          type: "행사",
        });

        // 태그 검사 및 NoticeTag 생성
        for (const tagObj of tagData) {
          if (title.includes(tagObj.tag)) {
            await NoticeTag.create({
              notice_id: createData.notice_id, // 생성된 Notice의 ID 사용
              userTag_id: tagObj.id,
            });
          }
        }
      }
    }
  } catch (error) {
    // 에러 발생 시 로그 생성
    await ServerLog.create({
      detail: "행사공지 정규 작업 중 서버 오류",
      log: JSON.stringify(error),
    });
    console.error("Error:", error.message);
    next(error); // Express 에러 핸들러로 넘기기
  }

  try {
    const todayStart = moment().startOf("day").toDate();
    const todayEnd = moment().endOf("day").toDate();

    const today_ = new Date();

    const currentMonth = today_.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1

    // 이번 달의 첫날 (1일)
    const firstDayOfMonth = new Date(today_.getFullYear(), today_.getMonth(), 1);

    // 첫 번째 날의 요일 (일요일: 0, 월요일: 1, ...)
    const dayOfWeek = firstDayOfMonth.getDay();

    // 첫 번째 날이 월요일이 아닌 경우, 해당 주는 첫 번째 주로 카운트되지 않도록 보정
    // 일요일(0)은 다음 주의 첫 날로 보고 계산
    const correctedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

    // 첫 번째 날부터 현재까지 날짜 차이 계산
    const daysSinceFirstDay = today_.getDate() + correctedDayOfWeek - 1;

    // 이번 달 몇 번째 주인지 계산
    const weekNumber = Math.ceil(daysSinceFirstDay / 7);

    const userList = await User.findAll({
      attributes: ["student_id", "student_PN", "updatedAt"],
      include: [
        {
          model: UserTag,
          attributes: ["id", "tag", "type"],
          include: [
            {
              model: NoticeTag,
              attributes: ["id", "notice_id", "createdAt"],
              where: {
                createdAt: {
                  [Op.between]: [todayStart, todayEnd],
                },
              },
              required: false,
            },
          ],
        },
      ],
    });

    const types = ["학사", "수업", "학적", "등록", "채플", "장학", "행사"];
    const counts = {};

    // 각 type별로 개수를 카운트
    for (let type of types) {
      const count = await Notice.count({
        where: {
          createdAt: {
            [Op.between]: [todayStart, todayEnd],
          },
          type: type,
        },
      });
      counts[type] = count;
    }

    // FormData 초기화
    const params = new FormData();

    params.append("mberId", process.env.API_MSG_ON_ID);
    params.append("accessKey", process.env.API_MSG_ON_KEY);
    params.append("callFrom", process.env.API_MSG_ON_PN);

    //
    const params_to_keyword = new FormData();

    params_to_keyword.append("mberId", process.env.API_MSG_ON_ID);
    params_to_keyword.append("accessKey", process.env.API_MSG_ON_KEY);
    params_to_keyword.append("callFrom", process.env.API_MSG_ON_PN);

    await userList.forEach((user, index) => {
      const targetTypes = ["수업", "학적", "등록", "채플", "장학", "행사"];
      if (user.UserTags?.some((tag) => targetTypes.includes(tag.type)) || false) {
        let 학사Count = 0;

        // "수업", "등록", "학적", "채플" 네 가지 항목이 모두 존재하는지 체크
        const 학사Tags = ["수업", "학적", "등록", "채플"];
        const hasAll학사Tags = 학사Tags.every((tag) => user.UserTags.some((userTag) => userTag.type === tag));

        if (hasAll학사Tags) {
          // 모든 항목이 존재하는 경우: 학사, 수업, 학적, 등록, 채플 모두 더한 값을 학사Count에 할당
          학사Count =
            학사Tags.reduce((sum, tag) => {
              return sum + (counts[tag] || 0);
            }, 0) + (counts["학사"] || 0); // "학사"도 추가
        } else {
          // 일부 항목만 존재하는 경우: 존재하는 항목만 합산하여 학사Count에 할당
          학사Count = user.UserTags.filter((tag) => 학사Tags.includes(tag.type)).reduce((sum, tag) => sum + (counts[tag.type] || 0), 0);
        }

        // 장학 카운트 처리
        const 장학Count = user.UserTags.filter((tag) => tag.type === "장학").reduce((sum, tag) => sum + (counts["장학"] || 0), 0);

        // 행사 카운트 처리
        const 행사Count = user.UserTags.filter((tag) => tag.type === "행사").reduce((sum, tag) => sum + (counts["행사"] || 0), 0);

        // 메시지 생성
        let messageContent = `[syuNotice] ${currentMonth}월 ${weekNumber}주 차:\n\n`;

        if (user.UserTags.some((tag) => 학사Tags.includes(tag.type))) messageContent += `학사 ${학사Count}건\n`;

        if (user.UserTags.some((tag) => tag.type === "장학")) messageContent += `장학 ${장학Count}건\n`;
        if (user.UserTags.some((tag) => tag.type === "행사")) messageContent += `행사 ${행사Count}건\n`;

        messageContent += `\n수신 거부:\nsyunotice.com/#/d`;

        // params에 메시지 추가
        params.append(`callTo_${index + 1}`, user.student_PN); // 수신자 번호
        params.append(`smsTxt_${index + 1}`, messageContent); // 문자 내용

        // 로그로 확인
        // console.log(`User ${index + 1} message:`, messageContent);
      }
      //
      //
      // User 태그 글 작성
      const hasValidNoticeTag = user.UserTags.some((userTag) => userTag.type === "" && userTag.NoticeTags.length > 0);

      if (hasValidNoticeTag) {
        let messageContent2 = `[syuNotice] 키워드\n\n`;
        // type이 ""인 태그가 존재할 경우 실행
        user.UserTags.forEach((userTag) => {
          if (userTag.type === "" && userTag.tag === "") {
            return;
          }

          if (userTag.type === "" && userTag.NoticeTags.length > 0) {
            messageContent2 += `${userTag.tag} ${userTag.NoticeTags.length}건\n`;
          }
        });

        messageContent2 += `\n`;

        // params에 메시지 추가
        params_to_keyword.append(`callTo_${index + 1}`, user.student_PN); // 수신자 번호
        params_to_keyword.append(`smsTxt_${index + 1}`, messageContent2); // 문자 내용
      }
    });
    // params.getBuffer(); // buffer로 데이터를 가져오기 위한 방법

    // params._streams.forEach((stream) => {
    //   console.log(stream); // FormData 객체의 모든 스트림 출력
    // });

    axios
      .post(process.env.API_MSG_URL_SEND, params, {
        headers: {
          ...params.getHeaders(), // FormData 헤더
        },
      })
      .then((response) => {
        if (response.data.resultCode === "0") {
          ServerLog.create({
            detail: "정규 문자 발송 성공 (auto)",
            log: JSON.stringify(response),
          });
        } else {
          ServerLog.create({
            detail: "정규 문자 발송 실패 resultCode (auto)",
            log: JSON.stringify(response),
          });
        }
      })
      .catch((error) => {
        ServerLog.create({
          detail: "정규 문자 발송 실패 (auto)",
          log: JSON.stringify(error),
        });
      });

    //
    //
    // 키워드 발송
    axios
      .post(process.env.API_MSG_URL_SEND, params_to_keyword, {
        headers: {
          ...params_to_keyword.getHeaders(), // FormData 헤더
        },
      })
      .then((response) => {
        if (response.data.resultCode === "0") {
          ServerLog.create({
            detail: "정규 키워드 문자 발송 성공 (auto)",
            log: JSON.stringify(response),
          });
        } else {
          ServerLog.create({
            detail: "정규 키워드 문자 발송 실패 resultCode (auto)",
            log: JSON.stringify(response),
          });
        }
      })
      .catch((error) => {
        ServerLog.create({
          detail: "정규 키워드 문자 발송 실패 (auto)",
          log: JSON.stringify(error),
        });
      });
  } catch (error) {
    await ServerLog.create({
      detail: "정규 문자 발송 실패 (auto)",
      log: JSON.stringify(error),
    });
    next(error);
  }
});

module.exports = router;
