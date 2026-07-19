'use strict';

// Données de test — ces Article sont fictifs, générés pour le développement local.
// Ils remplacent les appels réels à l'API OpenAlex (désactivés en local, voir README).
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

const TEMPLATES = [
  {
    titleSuffix: 'état de l\'art et perspectives 2026',
    summary: 'Cet Article de test passe en revue les avancées récentes du domaine et propose des pistes de recherche pour les prochaines années. Contenu généré pour les besoins du développement local.',
    year: 2026,
  },
  {
    titleSuffix: 'une approche pratique appliquée à l\'industrie',
    summary: 'Une étude de cas fictive illustrant l\'application des concepts du domaine dans un contexte industriel. Article de test destiné au seed de la base locale.',
    year: 2025,
  },
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();
    const rows = [];

    INTERESTS.forEach((interest, interestIndex) => {
      TEMPLATES.forEach((template, templateIndex) => {
        const n = interestIndex * TEMPLATES.length + templateIndex + 1;

        rows.push({
          openAlexId: `test-W${String(n).padStart(4, '0')}`,
          title: `${interest.label} : ${template.titleSuffix}`,
          authors: JSON.stringify([
            { name: 'A. Dupont', institution: 'Université de Test' },
            { name: 'M. Rossi', institution: 'Lab Fictif de Recherche' },
          ]),
          published: `${template.year}-01-15`,
          summary: template.summary,
          doi: `10.9999/test.${n}`,
          pdfUrl: null,
          isOpenAccess: templateIndex % 2 === 0,
          publicationYear: template.year,
          type: 'Article',
          link: `https://example.org/test-Article-${n}`,
          mainTopic: interest.label,
          topicScore: Math.round((0.7 + (n % 3) * 0.1) * 100) / 100,
          concepts: JSON.stringify([interest.id, interest.label]),
          subfield: interest.label,
          createdAt: now,
          updatedAt: now,
        });
      });
    });

    await queryInterface.bulkInsert('Article', rows);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Article', {
      openAlexId: { [Sequelize.Op.like]: 'test-W%' }
    });
  }
};
