'use strict';
module.exports = (sequelize, DataTypes) => {
  const activity = sequelize.define('activity', {
    text: DataTypes.TEXT,
    user_id: DataTypes.INTEGER,
    board_id: DataTypes.INTEGER
  }, {});
  activity.associate = function(models) {
    // associations can be defined here
  };
  return activity;
};