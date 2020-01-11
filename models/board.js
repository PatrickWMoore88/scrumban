"use strict";
module.exports = (sequelize, DataTypes) => {
  const board = sequelize.define(
    "board",
    {
      name: DataTypes.STRING,
      background: DataTypes.STRING,
      owner_id: DataTypes.INTEGER,
      member_ids: DataTypes.ARRAY(DataTypes.INTEGER),
      defaultValue: []
    },
    {}
  );
  board.associate = function(models) {
    // associations can be defined here
  };
  return board;
};
