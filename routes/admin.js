const express = require("express");
const router = express.Router();
const { decryptFun, encryptFun } = require("../util/crypto");
const { Sequelize, Op, where } = require("sequelize");
const fs = require("fs");
const axios = require("axios");
const qs = require("qs");
const FormData = require("form-data");
const https = require("https");
const cheerio = require("cheerio");
const moment = require("moment"); // 날짜 계산을 위해 moment.js를 사용

const { Notice, NoticeTag, UserTag, User, ServerLog } = require("../models");

// 사용자 조회
router.get("/user-num", async (req, res, next) => {
  try {
    const userList = await User.findAll({
      attributes: ["student_id", "student_name", "updatedAt"],
      include: [
        {
          model: UserTag,
          attributes: ["id", "tag", "type"],
          include: [
            {
              model: NoticeTag, // UserTag와 연결된 NoticeTag를 포함
              attributes: ["id", "notice_id", "createdAt"],
            },
          ],
        },
      ],
    });
    if (userList) {
      await ServerLog.create({
        detail: "사용자 조회 (admin)",
      });
      return res.status(200).send({ value: userList.length, console: encryptFun(userList, "") });
    } else {
      await ServerLog.create({
        detail: "사용자 조회 (admin)",
      });
      return res.status(400).send({ value: 0, console: encryptFun([], "") });
    }
  } catch (error) {
    console.error(error);
    await ServerLog.create({
      detail: "사용자 조회 서버 오류 (admin)",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

// 남은 메시지 / 단가 조회
router.get("/remaining-msg", async (req, res, next) => {
  // 전송 데이터
  const form = new FormData();
  form.append("mberId", process.env.API_MSG_ON_ID);
  form.append("accessKey", process.env.API_MSG_ON_KEY);

  // 요청 보내기
  try {
    const response = await axios.post(`${process.env.API_MSG_URL_REMAINING}`, form, {
      headers: {
        ...form.getHeaders(), // form-data 헤더 추가
      },
    });

    // 응답 처리
    if (response.data.resultCode !== "0") {
      // resultCode가 '0'이 아니면 401 응답 보내기
      await ServerLog.create({
        detail: "API 오류 (admin)",
        log: JSON.stringify(response.data),
      });
      return res.status(401).send("API 오류");
    }

    await ServerLog.create({
      detail: "문자 남은 전송량/단가 조회 (admin)",
    });
    // 정상적인 응답인 경우
    return res.status(200).send({ value1: response.data.data.shortSendPsbltEa, value2: response.data.data.shortPrice });
  } catch (error) {
    await ServerLog.create({
      detail: "문자 남은 전송량/단가 조회 서버 오류",
      log: JSON.stringify(error),
    });
    // 요청 중 오류가 발생한 경우
    console.error("Error:", error.response ? error.response.data : error.message);
    next(error); // 에러를 전달하여 에러 처리 미들웨어로 보냄
  }
});

// 메세지 발송 로그
router.get("/msg-log", async (req, res, next) => {
  try {
    const form = new FormData();
    form.append("mberId", process.env.API_MSG_ON_ID);
    form.append("accessKey", process.env.API_MSG_ON_KEY);
    form.append("pageSize", "100");

    const response = await axios.post(process.env.API_MSG_URL_LOG, form, {
      headers: {
        ...form.getHeaders(),
        "Content-Type": "multipart/form-data",
      },
    });

    await ServerLog.create({
      detail: "메세지 발송 로그 조회 (admin)",
    });
    res.status(response.status).send(encryptFun(response.data, ""));
  } catch (error) {
    await ServerLog.create({
      detail: "메세지 발송 로그 조회 중 서버 오류 (admin)",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

// 저장된 전체 공지 / 이번주 공지
router.get("/notice-num", async (req, res, next) => {
  try {
    const NoticeList = await Notice.findAll({
      include: [
        {
          model: NoticeTag,
        },
      ],
    });

    // 이번주 공지
    const now = moment(); // 현재 시간
    const lastFriday = now.clone().subtract(1, "weeks").day(5).hour(14).minute(1).second(0);
    const nowWeekNoticeList = await Notice.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastFriday.toDate(), // 지난주 금요일 오후 2시 1분 이후
          [Op.lte]: now.toDate(), // 현재 시간 이전
        },
      },
      include: [
        {
          model: NoticeTag,
        },
      ],
    });

    //
    const weekNoticeList_all = await Notice.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastFriday.toDate(), // 지난주 금요일 오후 2시 1분 이후
          [Op.lte]: now.toDate(), // 현재 시간 이전
        },
        type: {
          [Op.in]: ["수업", "학적", "등록", "채플"], // 타입이 이 네 가지 중 하나일 때
        },
      },
      include: [
        {
          model: NoticeTag,
        },
      ],
    });

    const weekNoticeList_1 = await Notice.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastFriday.toDate(), // 지난주 금요일 오후 2시 1분 이후
          [Op.lte]: now.toDate(), // 현재 시간 이전
        },
        type: "수업",
      },
      include: [
        {
          model: NoticeTag,
        },
      ],
    });
    const weekNoticeList_2 = await Notice.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastFriday.toDate(), // 지난주 금요일 오후 2시 1분 이후
          [Op.lte]: now.toDate(), // 현재 시간 이전
        },
        type: "학적",
      },
      include: [
        {
          model: NoticeTag,
        },
      ],
    });

    const weekNoticeList_3 = await Notice.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastFriday.toDate(), // 지난주 금요일 오후 2시 1분 이후
          [Op.lte]: now.toDate(), // 현재 시간 이전
        },
        type: "등록",
      },
      include: [
        {
          model: NoticeTag,
        },
      ],
    });

    const weekNoticeList_4 = await Notice.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastFriday.toDate(), // 지난주 금요일 오후 2시 1분 이후
          [Op.lte]: now.toDate(), // 현재 시간 이전
        },
        type: "채플",
      },
      include: [
        {
          model: NoticeTag,
        },
      ],
    });

    const weekNoticeList_scholarship = await Notice.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastFriday.toDate(), // 지난주 금요일 오후 2시 1분 이후
          [Op.lte]: now.toDate(), // 현재 시간 이전
        },
        type: "장학",
      },
      include: [
        {
          model: NoticeTag,
        },
      ],
    });

    const weekNoticeList_event = await Notice.findAll({
      where: {
        createdAt: {
          [Op.gte]: lastFriday.toDate(), // 지난주 금요일 오후 2시 1분 이후
          [Op.lte]: now.toDate(), // 현재 시간 이전
        },
        type: "행사",
      },
      include: [
        {
          model: NoticeTag,
        },
      ],
    });

    await ServerLog.create({
      detail: "저장된 공지 조회 (admin)",
    });

    res.status(200).send({
      NoticeList: { value: NoticeList.length, console: encryptFun(NoticeList || [], "") },
      nowWeekNoticeList: {
        value: nowWeekNoticeList.length,
        console: encryptFun(nowWeekNoticeList || [], ""),
      },
      weekNoticeList_all: { value: weekNoticeList_all.length, console: encryptFun(weekNoticeList_all || [], "") },
      weekNoticeList_1: { value: weekNoticeList_1.length, console: encryptFun(weekNoticeList_1 || [], "") },
      weekNoticeList_2: { value: weekNoticeList_2.length, console: encryptFun(weekNoticeList_2 || [], "") },
      weekNoticeList_3: { value: weekNoticeList_3.length, console: encryptFun(weekNoticeList_3 || [], "") },
      weekNoticeList_4: { value: weekNoticeList_4.length, console: encryptFun(weekNoticeList_4 || [], "") },
      weekNoticeList_scholarship: { value: weekNoticeList_scholarship.length, console: encryptFun(weekNoticeList_scholarship || [], "") },
      weekNoticeList_event: { value: weekNoticeList_event.length, console: encryptFun(weekNoticeList_event || [], "") },
    });
  } catch (error) {
    await ServerLog.create({
      detail: "저장된 공지 조회 중 서버 오류 (admin)",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

// 전체 태그 조회
router.get("/usertag-num", async (req, res, next) => {
  try {
    const userTag = await UserTag.findAll({
      where: {
        type: "", // 추가 조건
      },
      attributes: ["tag"],
      group: ["tag"],
    });

    await ServerLog.create({
      detail: "전체 태그 조회 (admin)",
    });
    res.status(200).send({ value: userTag.length, console: encryptFun(userTag || [], "") });
  } catch (error) {
    await ServerLog.create({
      detail: "전체 태그 조회 중 서버 오류 (admin)",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

router.get("/user-find/:student_id", async (req, res, next) => {
  const { student_id } = req.params;
  try {
    const data = await User.findAll({ where: { student_id: student_id } });

    await ServerLog.create({
      student_id: student_id,
      detail: "사용자 단일 정보 조회 (admin)",
    });
    return res.status(201).send(encryptFun(data, student_id));
  } catch (error) {
    await ServerLog.create({
      student_id: student_id,
      detail: "사용자 단일 정보 조회 중 서버 오류 (admin)",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

router.get("/user-updata/pn", async (req, res, next) => {
  const { student_id, student_PN } = req.params;

  try {
    const userdata = await User.findAll({ where: { student_id: student_id } });

    if (!userdata) {
      return res.status(401).send("학번으로 등록된 유저가 없습니다.");
    }

    const upData = await User.update(
      {
        student_PN: decryptFun(student_PN, student_id).student_PN,
      },
      { where: { student_id: student_id } }
    );

    if (!upData) return res.status(401).send("학번으로 등록된 유저가 없습니다.");

    const updata = await User.findAll({ where: { student_id: student_id } });

    if (updata) {
      await ServerLog.create({
        student_id: student_id,
        detail: "핸드폰 번호 수정 (admin)",
      });
      return res.status(201).send(encryptFun(updata, student_id));
    }
  } catch (error) {
    await ServerLog.create({
      student_id: student_id,
      detail: "핸드폰 번호 수정 중 서버 오류 (admin)",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

router.get("/user-updata/name", async (req, res, next) => {
  const { student_id, student_name } = req.params;

  try {
    const userdata = await User.findAll({ where: { student_id: student_id } });

    if (!userdata) {
      return res.status(401).send("학번으로 등록된 유저가 없습니다.");
    }

    const upData = await User.update(
      {
        student_name: decryptFun(student_name, student_id).student_PN,
      },
      { where: { student_id: student_id } }
    );

    if (!upData) return res.status(401).send("학번으로 등록된 유저가 없습니다.");

    const updata = await User.findAll({ where: { student_id: student_id } });

    if (updata) {
      await ServerLog.create({
        student_id: student_id,
        detail: "이름 수정 (admin)",
      });
      return res.status(201).send(encryptFun(updata, student_id));
    }
  } catch (error) {
    await ServerLog.create({
      student_id: student_id,
      detail: "이름 수정 중 서버 오류 (admin)",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

router.post("/user-delete", async (req, res, next) => {
  const { deleteId } = req.body;
  try {
    const data = await User.destroy({
      where: { student_id: deleteId },
    });

    if (data) {
      await ServerLog.create({
        student_id: deleteId,
        detail: "유저 탈퇴 (admin)",
      });
      return res.status(200).send(encryptFun(data, deleteId));
    } else {
      await ServerLog.create({
        student_id: deleteId,
        detail: "유저 탈퇴 실패 (admin)",
        log: JSON.stringify(err),
      });
      return res.status(401).send("실패하였습니다.");
    }
  } catch (error) {
    await ServerLog.create({
      student_id: student_id,
      detail: "유저 탈퇴 작업 중 서버 오류 (admin)",
      log: JSON.stringify(error),
    });
    res.status(401).send("Server에서 문제가 발생했습니다.");
    next(error);
  }
});

module.exports = router;
