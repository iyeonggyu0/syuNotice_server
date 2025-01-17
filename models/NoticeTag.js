module.exports = (sequelize, DataTypes) => {
  const NoticeTag = sequelize.define(
    "NoticeTag",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(100),
      },
      notice_id: {
        type: DataTypes.INTEGER(100),
        allowNull: false,
      },
      userTag_id: {
        type: DataTypes.INTEGER(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "NoticeTag",
      tableName: "noticetags",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  NoticeTag.associate = (db) => {
    db.NoticeTag.belongsTo(db.Notice, {
      foreignKey: "notice_id",
      sourceKey: "notice_id",
      onDelete: "CASCADE",
    });
    db.NoticeTag.belongsTo(db.UserTag, {
      foreignKey: "userTag_id",
      sourceKey: "id",
      onDelete: "CASCADE",
    });
  };
  return NoticeTag;
};
