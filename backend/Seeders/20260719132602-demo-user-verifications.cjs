'use strict';
const crypto = require('crypto');

module.exports = {
  async up(queryInterface, Sequelize) {
    // Récupère les userId réels des utilisateurs déjà seedés
    const users = await queryInterface.sequelize.query(
      `SELECT userId, email FROM User WHERE email IN ('alice@example.com', 'bob@example.com', 'charlie@example.com')`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const now = new Date();
    const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +24h

    const records = users.map(user => ({
      userId: user.userId,
      uniqueString: crypto.randomBytes(32).toString('hex'),
      createdAt: now,
      expiresAt: expires,
    }));

    await queryInterface.bulkInsert('UserVerificationSchema', records);
  },

  async down(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      `SELECT userId FROM User WHERE email IN ('alice@example.com', 'bob@example.com', 'charlie@example.com')`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    const userIds = users.map(u => u.userId);

    await queryInterface.bulkDelete('UserVerificationSchemas', {
      userId: userIds
    });
  }
};