'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.addColumn('users', 'contestId', {
        type: Sequelize.STRING,
        allowNull: false
    })
  },

    down: function(queryInterface, Sequelize) {
      return queryInterface.removeColumn('users', 'contestId')
    }
};
