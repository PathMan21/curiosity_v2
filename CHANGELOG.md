# Changelog: be curious

Toutes les modifications notables de ce projet seront documentées ici

## v0.1.0 - Initialisation du projet

### Added

- Initialisation du dépôt Git
- Architecture React + Express
- Configuration TypeScript
- Mise en place d'ESLint et Prettier
- Docker Compose
- Création du réseau Docker appnet
- Conteneur MariaDB
- Conteneur Redis
- Configuration des variables d'environnement

### Changed

- Organisation du projet en Frontend / Backend

### Infrastructure

- Première configuration Docker
- Volumes persistants MariaDB

## v0.2.0 - Authentification

### Added

- Authentification JWT
- Refresh Token
- Hashage des mots de passe avec bcrypt
- Vérification email
- Middleware d'authentification
- Gestion des rôles utilisateur

### Security

- Validation des mots de passe
- Expiration des Access Tokens
- Cookies HttpOnly

### Fixed

- Correction de la gestion des sessions
- Correction des expirations JWT

## v0.3.0 - Base métier

### Added

- Gestion des centres d'intérêt
- CRUD utilisateur
- Gestion du profil
- Synchronisation Sequelize

### Changed

- Refonte des modèles Sequelize
- Optimisation des relations SQL

### Fixed

- Correction des contraintes SQL
- Correction des clés étrangères

## v0.4.0 - Agrégation des contenus

### Added

- Intégration NewsAPI
- Intégration Unsplash
- Intégration OpenAlex
- Vérification des sources
- Agrégation multi-API
- Normalisation des réponses

### Performance

- Cache Redis
- Limitation des appels API

### Fixed

- Gestion des timeouts API
- Retry automatique

## v0.5.0 - Sécurisation

### Added

- Helmet
- Rate Limiting
- CORS
- Validation Zod
- Gestion centralisée des erreurs

### Security

- Protection XSS
- Protection CSRF
- Validation des entrées
- Headers HTTP sécurisés

### Fixed

- Correction des injections SQL potentielles
- Correction des erreurs de validation

## v0.6.0 - Qualité logicielle

### ✨ Added

- Vitest
- Tests unitaires
- Husky
- Lint automatique
- Formatage automatique

### Changed

- Refactorisation des services
- Factorisation des middlewares

### Fixed

- Correction des erreurs détectées par les tests

## v0.7.0 - DevOps

### Added

- GitHub Actions
- Pipeline CI
- Pipeline CD
- Déploiement automatique
- VPS OVH

### Performance

- Optimisation Docker Build
- Optimisation Docker Layers

### Changed

- Déploiement entièrement automatisé

## v0.8.0 - Observabilité

### Added

- Prometheus
- Grafana
- Node Exporter
- Healthchecks Docker
- Endpoint /metrics

### Monitoring

- Temps de réponse API
- CPU
- RAM
- Disponibilité
- Erreurs HTTP
- Santé des conteneurs

### Changed

- Ajout de métriques Prometheus

## v0.9.0 - Accessibilité

### Added

- Mode sombre
- Taille de police configurable
- Navigation clavier
- Attributs ARIA
- Vérification RGAA

### Changed

- Amélioration des contrastes

### Fixed

- Correction de la navigation clavier

## v1.0.0 - MVP

### Added

- Application complète
- Authentification
- Personnalisation des contenus
- Agrégation multi-API
- Gestion utilisateur
- Accessibilité
- Documentation technique
- Documentation utilisateur
- Manuel de déploiement

### Performance

- Optimisation Redis
- Optimisation Sequelize
- Réduction des appels API
- Compression HTTP

### Security

- OWASP Top 10
- JWT
- Helmet
- Rate Limiting
- Validation Zod
- HTTPS
- Variables d'environnement

### DevOps

- CI/CD GitHub Actions
- Docker Compose
- Monitoring Grafana
- Supervision Prometheus
- Sauvegardes MariaDB

### Fixed

- Stabilisation générale de l'application
- Correction des problèmes de Refresh Token
- Correction de plusieurs anomalies de navigation
- Amélioration de la gestion des erreurs API
- Optimisation des performances globales
