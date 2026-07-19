'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const hashedPassword = await bcrypt.hash('Password123!', 10);

      await queryInterface.bulkInsert('User', [
        {
          username: 'alice',
          email: 'alice@example.com',
          password: hashedPassword,
          picture: null,
          interests: 'cybersecurity,data-science',
          verified: true,
          isTemporary: false,
          refreshToken: null,
        },
        {
          username: 'bob',
          email: 'bob@example.com',
          password: hashedPassword,
          picture: null,
          interests: 'data-science',
          verified: true,
          isTemporary: false,
          refreshToken: null,
        },
        {
          username: 'charlie',
          email: 'charlie@example.com',
          password: hashedPassword,
          picture: null,
          interests: 'robotics',
          verified: false,
          isTemporary: false,
          refreshToken: null,
        },
      ])
    } catch (err) {
      console.error('DETAIL ERREUR:', err.errors || err);
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('User', {
      email: ['alice@example.com', 'bob@example.com', 'charlie@example.com']
    });
  }
};