const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const db = {};

const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.User = require("./User")(sequelize, Sequelize);
db.UserTag = require("./UserTag")(sequelize, Sequelize);
db.Notice = require("./Notice")(sequelize, Sequelize);
db.NoticeTag = require("./NoticeTag")(sequelize, Sequelize);
db.UserPNCerti = require("./UserPNCerti")(sequelize, Sequelize);

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
