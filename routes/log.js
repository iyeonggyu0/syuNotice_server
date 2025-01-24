const cron = require("node-cron");
const https = require("https");
const axios = require("axios");
const cheerio = require("cheerio"); // cheerio 추가
const { Op } = require("sequelize");
const moment = require("moment");
const FormData = require("form-data");

const express = require("express");
const router = express.Router();

const { ServerLog } = require("../models");

router.post("/create", async (req, res, next) => {
  try {
    await ServerLog.create({
      detail: "접속",
    });
    res.status(200).send("");
  } catch (error) {
    res.status(400).send("");
    next(error);
  }
});

module.exports = router;
