
**---------------------------------- 28/10 ----------------------------------**

*RAPPEL :*

`npm run dev`

*Avancée du jour :*

-> Ajout de express - node js - typescript en backend
-> React - ajout en front end

-> Trello : https://trello.com/b/6fi3BJm4/projet-m2-curiosity

*Choix techniques :*

- React : modulable, et qui peux se scaler plus facilement qu'une simple librairie, la réutilisation de composant est aussi pratique et rapide

- node js & type script : typescript me permettra d'avoir de la rigueur et de ne pas laisser aux hasard certains choix

- Mariadb : dans le cas de la database, j'ai préféré partir sur du sql, le nosql étant problématique pour les relations entre plusieurs database et contrairement à postgre mariadb est plus modulable et scalable

- Redis : gestion de cache

- BullMQ : background jobs ( gère une partie des actions pour un réseau social )

- Docker : containerisation du back et du front

- Jest / React Testing Library pour le frontend.

- Supertest / Mocha pour le backend.

- sequelize pour un orm mariadb

Pour scaler : 

- Load-balancer : pour répartir les requêtes en cas de trop gros surplus


*Organisation du backend :*

-> Config : database, avec configuration et appels orm
-> Controllers : Ajout des requêtes
-> Middleware : validation
-> Models : classes
-> Routes : Définitions des Routes
-> Services : logique métier

Organisation du frontend : 

-> Pages : affichage des pages réact
-> Components : composants réutilisables
-> assets : assets graphiques
-> Service : logique métier - appel du back

facultatif : -> helpers : logique globale



-> Prochaine étape : 
    - Connexion à la base de données


**---------------------------------- 30/10 ----------------------------------**

objectif : 
    - connexion à la base de données X

Aujourd'hui :
    -> Installation de sequelize comme orm pour mariadb X

Base de données relation :

    Table : User (one to many)
        -> Table : many to one - Likes
        -> Table : many to one - Commentaires (?)
        -> Table : many to one - Notifications
    
    Table : Posts (one to many)
        -> Table : many to one - Commentaires (?)
        -> Table : many to many - Likes (?)
        -> Table : many to many - Hashtags
        -> Table : many to one - Commentaires


**---------------------------------- 17/11 ----------------------------------**

Objectif :

    -> Faire fonctionner mariadb X
    -> Faire une première table user
    -> Envoyer des données

*choix techniques*

->  Mariadb ne vient pas avec un logiciel de visualisation donc : *dbeaver* permet de visualiser les tables,
    pourquoi ça plutôt qu'un autre ? Gratuit, conseillé par de nombreux utilisateurs de mariadb,
    et permet de visualiser les tables qui intéragissent entre elles

**---------------------------------- 18/11 ----------------------------------**

Objectifs :

    -> Installation et gestions de websocket X

*choix technologiques / d'archi* 

->  les websockets permettent de communiquer en TCP, contrairement aux envois de requêtes couteuses, 
    les données sont envoyés comme des paquets d'octets. 
    Nous en auront besoin ds notre projet pour la communication et le rafraichissement de la page d'accueil




**---------------------------------- 23/11 ----------------------------------**

*Objectif de la journée :*

-> Remplacement de ts par tsx backend et front end X
-> Réglage du problème avec les tables - j'arrive à synchroniser X
-> Faire une page de création et de login user X


*choix technologiques*

-> Le choix d'aujourd'hui se porte sur le toolkit frontend qui pourrait etre le mieux
    par défaut j'irais sur bootstrap mais, j'aimerais tester quelque chose d'optimisé : Pure.css
    Pure css est plus compacte et plus léger que bootstrap ainsi je vais essayer de toucher a ce toolkit

-> React :  Facile a prendre en main, utilise des composant réutilisable et se met a jour d'après les changements
            Avoir des composants permet d'être rapide et modulable

-> Tanstack query : Pour gérer les requêtes react, au lieu d'avoir la version traditionnelle react, je vais utiliser 
                    tanstack query, les query sont notamment cachés, gère 

-> Utilisation de PascalCasing

*Quelques questions perso :* 
-> Pourquoi le front et le back ont besoin d'un serveur séparés ?
-> Cela poses-t-il des problèmes de sécurités en prod ? Ou est ce qu'on mettra tout sur le même port ?
-> Pourquoi tsx marche en déclarant qu'il faut utiliser jsx dans le config.json


**---------------------------------- 24/11-26/11 ----------------------------------**

*Objectif de la journée :*

-> Inscrire un utilisateur dans la base de données X

*Circuit d'une "fonction" complète*

    - Va être envoyé du front en json à *route*
    - Va être ensuite valider par *Middleware* avec des fonctions qui viendront avant de s'executer
    - Controller va préparer le corps de ce qui est demandé mais ne va pas l'executer
    - Service va envoyer / executer ce qui est envoyé


**---------------------------------- 29/11 ----------------------------------**


*Objectifs*

- Changer le readme - a avancees X

- Système de validations par mail X
- Inscris l'utilisateur en bdd X

- Faire un système de login qui identifie l'utilisateur 
- Faire la sécurité des utilisateurs
- Faire l'orga du reste
- implémenter de l'oAuth => connexion avec google

*objectifs personnels*
- ne pas utiliser chat ou claude

*choix technologiques*
-> Le jwt est efficace dans un système avec de nombreux services comme le notre :
    un token d'authentification comme un cookie devrait être renvoyé entre les services,
    
    j'envoie le token, le service le reçois, le renvoie au serveur pour checker, le serveur renvoie la validations etc...
    c'est très long et ça nous fait perdre du temps

    Le jwt a toutes les infos en lui, donc une fois que le service le reçoit il sait qui l'utilisateur est et si il est valide

-> NodeMailer : envoyer des mails
    - pas de dépendance 
    - s'installe en npm 
    - gratuit

**---------------------------------- 02/12 ----------------------------------**


-> Calendrier du rendu - décembre X
-> Faire un système de login qui identifie l'utilisateur 

**---------------------------------- 07-09/12 ----------------------------------**


*Objectifs*
- implémenter de l'oAuth => connexion avec google

*objectifs personnels*
- ne pas utiliser chat ou claude

**Comment fonctionne l'oAuth :**

Avant d'avoir accès : 
Le client - notre serveur => Redirection sur le serveur d'authorisation
Le serveur d'autorisation renvoie une autorisation au client
Le client retourne cette fameuse autorisation au serveur d'autorisation, qui cette fois ci envoie l'accès

Après avoir accès :
Le client va avoir accès donc au serveur de ressource de google, qui renvoie les données


->**Deux types de 'flow'**

*authorization code flow :*
1. Fait un appel au serveur
2. Le serveur renvoie un code d'autorisation 
3. renvoie une demande de token a un endpoint (?) avec mon code de validation
4. A un token d'accès

*Implicit code flow :*

1. Demande une autorisation a un endpoint d'autorisation
2. A un token d'accès directement de cet endpoint


*Conclusion* 
nous allons prendre la méthode d'authorisation, car en implicit 
- le hacking est trop vite arrivé avec une attaque Man-in-the-middle (?)

Le flow d'authorisation : est plus sécurisés, grace a code_challenge et code_verifier qui font
un back and forth entre le client et le serveur. 
ça s'appelle PKCE (en français : la clé sécurisé pour l'échange de code)

Le serveur enregistre : code_challenge et code_challenge_method et quand on demande donc
un token d'accès pour avoir la ressources demandés : il vérifie code_verifier avec code_challenge et code_challenge_method



-> *Scopes* : 
scope est l'accès qu'on souhaite demander a notre serveur d'autorisation, 
quels accès nous avons besoin pour cette pour notre client, et nous pourrons avec le code d'autorisation 
demander les ressources

->*Grant type* :
Grant type est un query parameters (?) sur la route /token qui indique ce que le token ou le code,
aura comme accès, actuellement il y a : 'client_credentials', 'authorisation_code' etc...

-> *redirect_uri* : 
une url qui redirige l'utilisateur après le back and forth avec le serveur d'autorisation,
et qu'il obtient le token d'accès. Faire attention parce que cette valeur doit avoir les uris
autorisés sur google.

-> *response_type* : 
il y a plusieurs méthode d'autorisation pour oauth, par code, ou par token,
c'est ce que nous donnera le serveur si on se fait authentifié par le serveur d'authorisation

->*Access_type* :
Options qui détermines si on transmet un token de rafraichissement pour l'utilisation hors ligne


**---------------------------------- 12/12 ----------------------------------**

-> Finir inscription avec oauth
    -> Oauth finit coté renvoie de token : X
    -> Création spécifique oauth à configurer :
    
-> Connexion avec oauth

**---------------------------------- 16/12 ----------------------------------**

-> Finir inscription avec oauth
    -> Création de l'utilisateur avec oauth X
    -> Protéger les routes invisible

**---------------------------------- 21/12 ----------------------------------**

-> Finir inscription avec oauth
    -> Finir l'inscription via complete register - avec interests X
    -> Protéger les routes invisible X
    -> Ajouter les interests dans la finalisation du profil X

**---------------------------------- 22/12 - 23/12 ----------------------------------**

-> Faire une page profile dans routes protégés X
-> Profile rajouter les informations de l'utilisateurs
-> Rediriger avec les routes non protégés à protégés : X
    en gros si on n'est pas connecté on va sur login automatiquement si on essais d'accéder à autre chose
    et si on est connecté - login et register sont remplacés par Home


-> Mise en place de docker
-> Faire une page template principal X

-> Pas de suppression de jwt ou refresh - a corriger X 
    -> C'est corrigé X

*Remplacement de technologie* : Pure css par bootstrap -  bootstrap offre une large gamme de composants déjà fait
donc ça sera bien plus simple pour la rapidité


**---------------------------------- 26/12 ----------------------------------**

-> Profile rajouter les informations de l'utilisateurs
-> Bugs trouvés : les routes de complete-register sont protégés, mais il n'a pas eu le temps de créer un jwt pour l'authentifier
-> Bugs trouvés : pas tout les éléments sélectionnés dans complete inscription s'inscrive


**---------------------------------- 10/01-12/01 ----------------------------------**

-> La vérification de token ne fonctionne pas X

-> Réglage des bugs concernants le profil et l'affichage, également il n'affichait plus mes routes X

-> Bugs sur les routes protégés / non protégés - se redirige quand je les places dans non protected or protected 

**---------------------------------- 13/01 ----------------------------------**

-> Mettre à jour le token pour qu'il prenne les nouvelles infos quand je m'inscris - réglé : j'ai rajouter des infos au token X
-> Egalement j'aimerais mettre plusieurs niveau de vérification - verified - non verified => qui me permettent de voir des routes selon le niveau avancés qu'ils ont 

-> Ajout de l'update pour le profile

Changement d'architecture, le jwt qui contiens les informations est trop sensibles aux attaque  xss donc simplement
j'ai remplacé par un microservice qui va récupérer les infos utilisateurs et les mets a jours si besoin

également le jwt était assez gros en terme de données