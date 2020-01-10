"use strict";
module.exports = (sequelize, DataTypes) => {
  const card = sequelize.define(
    "card",
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      order: DataTypes.INTEGER,
      archived: DataTypes.BOOLEAN,
      list_id: DataTypes.INTEGER,
      board_id: DataTypes.INTEGER,
      members: DataTypes.ARRAY(DataTypes.STRING)
    },
    {}
  );
  card.associate = function(models) {
    // associations can be defined here
  };
  return card;
};
