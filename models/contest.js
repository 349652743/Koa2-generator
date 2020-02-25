'use strict';
module.exports = (sequelize, DataTypes) => {
  const contest = sequelize.define('contest', {
    contestName: DataTypes.STRING,
    endTime: DataTypes.STRING,
    openRegister: DataTypes.BOOLEAN
  }, {});
  contest.associate = function(models) {
    // associations can be defined here
  };
  return contest;
};