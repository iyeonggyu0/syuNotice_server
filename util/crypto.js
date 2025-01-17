const crypto = require("crypto-js");

const encryptFun = (data, studentId) => {
  return crypto.AES.encrypt(JSON.stringify(data), process.env.CRYPTO_KEY + studentId).toString();
};

// 복호화 메서드
const decryptFun = (text, studentId) => {
  try {
    const bytes = crypto.AES.decrypt(text, process.env.CRYPTO_KEY + studentId);
    const returnText = JSON.parse(bytes.toString(crypto.enc.Utf8));
    return JSON.parse(bytes.toString(crypto.enc.Utf8));
  } catch (err) {
    console.log(err);
    return;
  }
};

module.exports = {
  encryptFun,
  decryptFun,
};
