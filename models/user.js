"use strict";
module.exports = (sequelize, DataTypes) => {
  const user = sequelize.define(
    "user",
    {
      name: DataTypes.STRING,
      display_name: DataTypes.STRING,
      githubid: DataTypes.TEXT,
      googleid: DataTypes.TEXT,
      password: DataTypes.TEXT
    },
    {}
  );
  user.associate = function(models) {
    // associations can be defined here
  };
  return user;
};
