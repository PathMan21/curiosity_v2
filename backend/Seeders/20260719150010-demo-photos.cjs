'use strict';

// Données de test — ces Photo utilisent des images de substitution libres de droits
// (picsum.Photo, seedées de façon déterministe) pour remplacer les appels réels à
// l'API Unsplash (désactivés en local, voir README).
const INTERESTS = [
  { id: 'ai-ml', label: 'Intelligence Artificielle & Machine Learning' },
  { id: 'computer-science', label: 'Informatique & Programmation' },
  { id: 'cybersecurity', label: 'Cybersécurité' },
  { id: 'data-science', label: 'Data Science' },
  { id: 'robotics', label: 'Robotique' },
  { id: 'computer-vision', label: 'Vision par Ordinateur' },
  { id: 'nlp', label: 'Traitement du Langage Naturel' },
  { id: 'computer-networks', label: 'Réseaux & Télécommunications' },
  { id: 'software-engineering', label: 'Génie Logiciel' },
  { id: 'databases', label: 'Bases de Données' },
  { id: 'distributed-systems', label: 'Systèmes Distribués & Cloud' },
  { id: 'quantum-computing', label: 'Informatique Quantique' },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const rows = INTERESTS.map((interest, index) => {
      const seed = `test-${interest.id}`;
      return {
        unsplashId: `test-${index + 1}`,
        url: `https://picsum.Photo/seed/${seed}/1200/800`,
        thumb: `https://picsum.Photo/seed/${seed}/400/300`,
        description: `Illustration de test pour le thème : ${interest.label}`,
        Photographer: 'Photo de test (picsum.Photo)',
        PhotographerLink: 'https://picsum.Photo/',
        downloadLink: `https://picsum.Photo/seed/${seed}/1200/800`,
        interest: interest.id,
        type: 'Photo',
        createdAt: now,
        updatedAt: now,
      };
    });

    await queryInterface.bulkInsert('Photo', rows);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Photo', {
      unsplashId: { [Sequelize.Op.like]: 'test-%' }
    });
  }
};
