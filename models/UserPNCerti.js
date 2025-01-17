module.exports = (sequelize, DataTypes) => {
  const UserPNCerti = sequelize.define(
    "UserPNCerti",
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER(100),
      },
      student_id: {
        type: DataTypes.INTEGER(100),
        allowNull: false,
      },
      student_PN: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
    },
    {
      sequelize,
      timestamps: true,
      modelName: "UserPNCerti",
      tableName: "UserPNCertis",
      charset: "utf8",
      collate: "utf8_general_ci",
    }
  );
  UserPNCerti.associate = (db) => {
    // db.UserPNCerti.belongsTo(db.User, {
    //   foreignKey: "student_id",
    //   sourceKey: "student_id",
    // });
  };
  return UserPNCerti;
};
