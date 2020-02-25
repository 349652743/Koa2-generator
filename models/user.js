'use strict';
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define('user', {
    name: DataTypes.STRING,
    sex: DataTypes.STRING,
    studentId: DataTypes.STRING,
    department: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    haveQueried: DataTypes.BOOLEAN,
    contestId:DataTypes.STRING,
    seatNumber:DataTypes.STRING,
  }, {});
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};