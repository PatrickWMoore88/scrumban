"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("cards", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      title: {
        type: Sequelize.STRING
      },
      description: {
        type: Sequelize.TEXT
      },
      order: {
        type: Sequelize.INTEGER
      },
      archived: {
        type: Sequelize.BOOLEAN
      },
      list_id: {
        type: Sequelize.INTEGER
      },
      board_id: {
        type: Sequelize.INTEGER
      },
      members: {
        type: Sequelize.ARRAY(Sequelize.STRING)
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("cards");
  }
};
