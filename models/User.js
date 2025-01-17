module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      student_id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.STRING(100),
      },
      student_PN: {
        type: DataTypes.STRING(100),
      },
      student_name: {
        type: DataTypes.STRING(100),
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "User",
      tableName: "users",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  User.associate = (db) => {
    // 커뮤니티 댓글 작성
    db.User.hasMany(db.UserTag, {
      foreignKey: "student_id",
      sourceKey: "student_id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  };
  return User;
};
