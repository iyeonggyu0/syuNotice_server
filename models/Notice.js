module.exports = (sequelize, DataTypes) => {
  const Notice = sequelize.define(
    "Notice",
    {
      notice_id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(100),
      },
      notice_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      notice_date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(100),
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "Notice",
      tableName: "Notices",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  Notice.associate = (db) => {
    // 커뮤니티 댓글 작성
    db.Notice.hasMany(db.NoticeTag, {
      foreignKey: "notice_id",
      sourceKey: "notice_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };
  return Notice;
};
