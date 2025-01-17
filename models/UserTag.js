module.exports = (sequelize, DataTypes) => {
  const UserTag = sequelize.define(
    "UserTag",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(100),
      },
      student_id: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      tag: {
        type: DataTypes.STRING(100),
      },
      type: {
        type: DataTypes.STRING(100),
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "UserTag",
      tableName: "usertags",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  UserTag.associate = (db) => {
    db.UserTag.belongsTo(db.User, {
      foreignKey: "student_id",
      sourceKey: "student_id",
      onDelete: "CASCADE", // User 삭제 시 UserTag 삭제
    });

    db.UserTag.hasMany(db.NoticeTag, {
      foreignKey: "userTag_id",
      sourceKey: "id",
      onDelete: "CASCADE", // UserTag 삭제 시 NoticeTag 삭제
    });
  };
  return UserTag;
};
