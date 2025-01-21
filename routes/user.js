const express = require("express");
const router = express.Router();
const { decryptFun, encryptFun } = require("../util/crypto");
const { Sequelize, Op } = require("sequelize");
const fs = require("fs");
const axios = require("axios");
const qs = require("qs");
const FormData = require("form-data");
const moment = require("moment");
require("dotenv").config();

const { User, UserTag, UserPNCerti, ServerLog } = require("../models");

//** { studentId: studentId, pn: pn } 형식으로 받아 T/F을 리턴 */
router.post("/send-phonenumber", async (req, res, next) => {
  try {
    const fiveMinutesAgo = Sequelize.literal("NOW() - INTERVAL 5 MINUTE");

    // 5분 이내에 생성된 인증 데이터가 있는지 확인
    const certificate = await UserPNCerti.findOne({
      where: {
        student_id: req.body.student_id,
        createdAt: {
          [Op.gte]: fiveMinutesAgo,
        },
      },
    });

    // 인증 코드 생성
    const num = Math.floor(100000 + Math.random() * 900000).toString();

    // 인증 코드가 이미 발급되지 않은 경우 처리
    if (!certificate) {
      const createData = await UserPNCerti.create({
        student_id: req.body.student_id,
        student_PN: decryptFun(req.body.student_PN, req.body.student_id), // 전화번호 복호화
        code: num,
      });

      // 생성된 데이터가 있으면 SMS 전송
      if (createData) {
        const form1 = new FormData();
        form1.append("mberId", process.env.API_MSG_ON_ID);
        form1.append("accessKey", process.env.API_MSG_ON_KEY);
        const msgNum = await axios.post(`${process.env.API_MSG_URL_REMAINING}`, form1, {
          headers: {
            ...form1.getHeaders(), // form-data 헤더 추가
          },
        });

        if (msgNum.data.data.pictureSendPsbltEa < 10) {
          return res.status(401).send("Server 오류");
        }

        const form2 = new FormData();
        form2.append("mberId", process.env.API_MSG_ON_ID);
        form2.append("accessKey", process.env.API_MSG_ON_KEY);
        form2.append("callFrom", process.env.API_MSG_ON_PN);
        form2.append("test_yn", "");
        form2.append("callToList", decryptFun(req.body.student_PN, req.body.student_id));
        form2.append("smsTxt", `[syuNotice] 인증 번호는 [ ${num} ]입니다.`);

        // return res.status(201).send("발신이 꺼져있습니다 (개발모드)");
        // 발송 로직
        const response = await axios.post(`${process.env.API_MSG_URL_ONE_SEND}`, form2, {
          headers: {
            ...form2.getHeaders(), // form-data 헤더 추가
          },
        });

        if (response.data.resultCode === "0") {
          res.status(201).send("인증 번호 발송 완료");
        } else {
          res.status(401).send("API 오류가 발생했습니다.");
        }
      } else {
        // 인증 코드 생성 실패 시
        res.status(401).send("재발송 대기시간입니다.");
      }
    } else {
      // 인증 코드가 이미 발송된 경우
      res.status(401).send("재발송 대기시간입니다.");
    }
  } catch (err) {
    console.error(err);
    await ServerLog.create({
      student_id: req.body.student_id,
      detail: "인증번호 발송 오류",
      log: JSON.stringify(err),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(err);
  }
});

router.post("/sing-up", async (req, res, next) => {
  const { studentId, pw, data } = req.body;
  const now = moment(); // 현재 시간
  const fiveMinutesAgo = moment().subtract(5, "minutes");

  try {
    // 유저의 인증 데이터 찾기
    const matchingData = await UserPNCerti.findOne({
      where: {
        student_PN: decryptFun(data, studentId).pn, // 핸드폰 번호로 확인
        student_id: studentId, // 학번으로 확인
      },
      order: [["updatedAt", "DESC"]],
    });

    if (!matchingData) {
      return res.status(403).send("인증 번호가 발송되지 않았습니다.");
    }

    const createdAtMoment = moment(matchingData.createdAt);

    if (!createdAtMoment.isBetween(fiveMinutesAgo, now, null, "[)")) {
      return res.status(402).send("유효시간 초과");
    }

    // 인증번호 확인
    if (matchingData.code === pw) {
      // 기존 유저 확인
      let existingUser = await User.findOne({
        where: {
          student_id: studentId,
        },
      });

      // 기존 유저가 존재하면, 해당 유저의 태그 삭제
      if (existingUser) {
        // 유저와 연결된 태그들을 삭제
        await UserTag.destroy({
          where: {
            student_id: studentId,
          },
        });

        // 기존 유저의 태그를 새로 추가
        if (decryptFun(data, studentId).class_1 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "수업",
          });
        }
        if (decryptFun(data, studentId).record_1 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "학적",
          });
        }
        if (decryptFun(data, studentId).registration_1 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "등록",
          });
        }
        if (decryptFun(data, studentId).chapel_1 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "채플",
          });
        }
        if (decryptFun(data, studentId).receive_2 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "장학",
          });
        }
        if (decryptFun(data, studentId).receive_3 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "행사",
          });
        }

        // 키워드 처리
        if (decryptFun(data, studentId).keyword_4.length > 1) {
          decryptFun(data, studentId).keyword_4.forEach((value) => {
            UserTag.create({
              student_id: studentId,
              tag: value,
              type: "",
            });
          });
        }

        await ServerLog.create({
          student_id: studentId,
          detail: "유저 정보 수정",
          log: "",
        });

        // 기존 유저에 대한 응답
        return res.status(201).send("기존 유저 데이터 갱신 완료");
      } else {
        // 기존 유저가 없으면 새로 생성
        const createData = await User.create({
          student_id: studentId,
          student_name: decryptFun(data, studentId).studentName,
          student_PN: decryptFun(data, studentId).pn,
        });

        if (!createData) {
          return res.status(400).send("데이터 생성에 실패하였습니다.");
        }

        // 새로 생성된 유저에 태그 추가
        if (decryptFun(data, studentId).class_1 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "수업",
          });
        }
        if (decryptFun(data, studentId).record_1 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "학적",
          });
        }
        if (decryptFun(data, studentId).registration_1 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "등록",
          });
        }
        if (decryptFun(data, studentId).chapel_1 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "채플",
          });
        }
        if (decryptFun(data, studentId).receive_2 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "장학",
          });
        }
        if (decryptFun(data, studentId).receive_3 === "true") {
          UserTag.create({
            student_id: studentId,
            tag: "",
            type: "행사",
          });
        }

        // 키워드 처리
        if (decryptFun(data, studentId).keyword_4.length > 1) {
          decryptFun(data, studentId).keyword_4.forEach((value) => {
            UserTag.create({
              student_id: studentId,
              tag: value,
              type: "",
            });
          });
        }

        await ServerLog.create({
          student_id: studentId,
          detail: "가입",
        });
        return res.status(201).send("유저 데이터 생성 완료");
      }
    } else {
      return res.status(401).send("인증 번호가 일치하지 않습니다.");
    }
  } catch (error) {
    await ServerLog.create({
      student_id: studentId,
      detail: "가입 오류",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

router.post("/delete", async (req, res, next) => {
  const { student_id, pn, pw, name } = req.body;
  const now = moment(); // 현재 시간
  const fiveMinutesAgo = moment().subtract(5, "minutes");

  try {
    const matchingData = await UserPNCerti.findOne({
      where: {
        student_PN: decryptFun(pn, student_id), // 핸드폰 번호로 확인
        student_id: student_id, // 학번으로 확인
      },
      order: [["updatedAt", "DESC"]],
    });

    if (!matchingData) {
      return res.status(403).send("인증 번호가 발송되지 않았습니다.");
    }

    const createdAtMoment = moment(matchingData.createdAt);

    if (!createdAtMoment.isBetween(fiveMinutesAgo, now, null, "[)")) {
      return res.status(402).send("유효시간 초과");
    }

    if (matchingData.code !== pw) {
      return res.status(401).send("인증 번호가 일치하지 않습니다.");
    }

    const data = await User.destroy({
      where: { student_id: student_id, student_PN: decryptFun(pn, student_id), student_name: decryptFun(name, student_id) },
    });

    // 삭제된 데이터가 있으면,
    if (!data) {
      await ServerLog.create({
        student_id: student_id,
        detail: "정보 불일치 오류",
      });
      return res.status(401).send("학번 / 핸드폰 번호 / 이름이 일치하지 않습니다. 관리자한테 문의해 주세요");
    }
    const user = await User.findOne({
      where: { student_id: student_id },
    });

    if (!user) {
      await ServerLog.create({
        student_id: student_id,
        detail: "탈퇴",
      });
      return res.status(201).send("완료되었습니다");
    } else {
      await ServerLog.create({
        student_id: student_id,
        detail: "탈퇴 처리중 오류",
      });
      return res.status(403).send("삭제가 완벽하게 이루어지지 않았습니다. 관리자한테 문의해 주세요");
    }
  } catch (error) {
    console.error(error);
    await ServerLog.create({
      student_id: student_id,
      detail: "탈퇴중 서버 오류",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

router.get("/user-num", async (req, res, next) => {
  try {
    const data = await User.findAll({});

    if (data.length >= 150) {
      return res.status(400).send(false);
    }

    res.status(200).send(true);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
