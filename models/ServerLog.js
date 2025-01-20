module.exports = (sequelize, DataTypes) => {
  const ServerLog = sequelize.define(
    "ServerLog",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(100),
      },
      student_id: {
        allowNull: true,
        type: DataTypes.STRING(100),
      },
      detail: {
        type: DataTypes.STRING(300),
        allowNull: true,
      },
      log: {
        type: DataTypes.JSON,
        allowNull: true,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "ServerLog",
      tableName: "ServerLogs",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  ServerLog.associate = (db) => {
    // 커뮤니티 댓글 작성
    // db.User.hasMany(db.UserTag, {
    //   foreignKey: "student_id",
    //   sourceKey: "student_id",
    //   onDelete: "CASCADE",
    //   onUpdate: "CASCADE",
    // });
  };
  return ServerLog;
};
