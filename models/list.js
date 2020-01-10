'use strict';
module.exports = (sequelize, DataTypes) => {
  const list = sequelize.define('list', {
    name: DataTypes.STRING,
    order: DataTypes.INTEGER,
    archived: DataTypes.BOOLEAN,
    board_id: DataTypes.INTEGER
  }, {});
  list.associate = function(models) {
    // associations can be defined here
  };
  return list;
};