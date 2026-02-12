
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

*Choix pour les api*

Le principal de l'application réside dans les api appelées externes, qui vont avoir du de certains thèmes récupérés, 
cela aide à controller ce qui va sur le site
à empêcher à ce que le site parte sur des choses négatives
à empêcher les contenus de dériver sur des choses qui ne refèterais pas la plateforme
à faire la modération par intéraction

Je fais donc une liste des api gratuite, légale et ouverte qui pourrons nous aider dans le fichier : api_lists.md


*V1* => 2 domaines - 4 - 5 api qui s'affiche sur un fil d'actualité, avec vidéo contenu textuel etc... 
pas d'affichage sur le site des articles etc.. renvoie sur le site en question 
*V2* => 4 domaines avec des sous domaines tel que : informatique > ia > machine learning
*V3* => Rajouter les notifications push, un système de filtre et de likes
*V4* => 5-7 domaines, une gestion par ia légère (algorithme) de ce qui doit apparaitre 

**---------------------------------- 14/01 ----------------------------------**

- *comment fonctionne arxiv*

Je vais commencer par l'api arxiv car il possède toutes les données nécessaires, pour tout les articles scientifiques

voilà comment l'utiliser : on appelle en GET / POST le site via une requête HTTP: 
- http://export.arxiv.org/api/{method_name}?{parameters} 

Il faudra ensuite parser le xml avec npm install xml2js

**---------------------------------- 15/01 ----------------------------------**

*tâches à faire :*

- Allez chercher 20 recherches techniques d'après les volontées de l'utilisateur X
    j'ai décidé de stocker dans un json interests tout les intéret par grande catégorie

- Faire un système qui récupère plutot des catégories générale pour limiter les appels api

- Mettre une autre api plus accessible actuellement arxiv est trop technique et donc peu ludique


*choix technique*

- après réflexion il vaut mieux 5-8 api pas plus, cela pourrait provoqué :
    - trop d'api différente - ingérable le système le temps d'appels étant trop différent
    - chaotique et très ingérable

- donc nous allons avoir 3 api principales : données globales intéressantes qui couvre tt les intérets
- et des sous api qui sont plus spécialisés par branche ( informatique, science, astronomie etc....)

- également je vais remplacer arxiv par quelque chose de plus intelligible et retirer le coté trop technique de l'application, également organiser
quelles api sont le mieux

**Indispensable**
    - OpenAlex ( même chose que arxiv sur tout les domaines mais, plus facile à digérer )      
    - Wikipedia ( global - pour avoir des résumés et différents sujets )
    - Unsplash ( image, intêret visuel )
    - Youtube ( rajouter du visuel intéressant )

**Ludique**
    - Open Trivia : ( questions à poser, interactif )

**Spécialisation**
    - NewsAPI : Rester au courant des dernières avancées selon les domaines

**Facultatif**
    - Wolfram Alpha : des jeux / calculs / graphiques interactifs - pour mieux apprendre
    - NASA API : des images magnifiques qui permettrait d'être un peu wow


**---------------------------------- 18/01 ----------------------------------**

**Problème de Openalex**
- problème rencontré : les champs globaux sont trop larges et allez chercher des articles trop différents du sujet de base, donc les sous champs sont plus correspondant
    - la solution est de les mettres en sous champs c'est plus précis

**---------------------------------- 19/01 ----------------------------------**

- Aujourd'hui :

Réglage du bug concernant les champs trop globaux, ainsi que revoir si il y a des niveaux de compexité en terme d'article
le problème en plus de la variation trop forte entre le sujet principal et ce que l'algo de open alex montre, c'est que...

- les articles sont très complexes, ça n'est pas si intéressant à lire X
    j'ai trié par articles qui sont dans la catégorie reviews, 
    qui ont beaucoup de fois les termes cités : cela veux dire que il est souvent bien reliés et facile à lire

- la redirection des articles parfois amène a des articles payants X
    -> Réglé avec ao3 : true

- la variation des type de contenus n'est pas très intéressante

- rajouter un certains nombres de sources qui sont plus généralistes dans les reviews

**---------------------------------- 20/01 ----------------------------------**

A faire aujourd'hui : 
-> Rajout d'un filtre qui check les sources des articles / des reviews - avec pour chacun des thèmes des sources précises X
    -> Fait fonctionne bien mieux qu'avant
-> Rajout d'une deuxième api - NewsAPI - qui ira récupérer les news 
        -> Après considération je bouge sur : https://newsmesh.co/ qui est moins cher - plus abordable

-> Egalement prévoir un jour dans la semaine où je travaille sur la documentation

__Nous en sommes toujours à la :__ 

*V1* => tt les domaines 3 - 4  api qui s'affiche sur un fil d'actualité, avec vidéo contenu textuel etc... 
pas d'affichage sur le site des articles etc.. renvoie sur le site en question 

**---------------------------------- 21/01 ----------------------------------**

*A faire aujourd'hui*

-> Mettre en place newsmech, essayer d'appeler les news selon les domaines, 
pour les différencier il nous faut de nouvelles couleurs

-> Une des erreurs que je fais actuellement c'est de trop m'imaginer comment les choses vont évoluer - tout les algorithmes à faire etc..
    -> Avec tout ce qu'il y a à faire je dois me limiter dans le travail - je dois donc d'abord faire la v1 avec 3 api 
    -> Après faire le système de redis pour que les posts aillent chercher et distribue équitablement

**---------------------------------- 22/01 ----------------------------------**

-> Lire la documentation
-> Commencer le tri des compétences obligatoires / facultatives 
-> Trier le plus urgent au moins urgent


**---------------------------------- 28/01 ----------------------------------**

-> J'ai mis en place newsmech - maintenant : Unsplash


**---------------------------------- 29/01 ----------------------------------**

-Unsplash mis, openalex sort des articles en allemand etc... sortir des articles en anglais exclusivement
- prochaine étape les faire liker 
- Posts des utilisateurs
- Deepstash est mon concurrent => https://deepstash.com/ 
    - faire une analyse concurrentiel - pour contre ce qu'ils en pensent etc...



**---------------------------------- 31/01 ----------------------------------**

-> Reddis - contrairement a une base de données, le système de cache dynamique se situe sur la ram et permet de façon
rapide d'accèder donc aux données, les appels sont rapide en raison de l'utilisation de la ram


Le stockage Redis se fera :

**OpenAlex :** DB + Redis cache long (environ 7 jours)

DB = Stockage permanent de tout ce qui est consulté
Redis = Accélération accès aux publications populaires

**Newsmech :** DB + Redis cache court (7 jours)

DB = Stockage temporaire (30 jours max, auto-cleanup)
Redis = Fraîcheur garantie

**Unsplash :** DB + Redis cache très long (30 jours) + CDN

DB = Métadonnées + tracking usage
Redis = Éviter requêtes API (quotas stricts)
CDN = Héberger images vous-même

Etant données que je suis sur reddis et que ça fonctionne sur linux / ubuntu il faut que je mette en place docker d'abord

-> Mission d'aujourd'hui :

    - docker
    - redis mettre en place le début du système 
        - au mieux pour les trois services

**---------------------------------- 01/02 ----------------------------------**

-> DOCKER FONCTIONNE

**---------------------------------- 05/02 ----------------------------------**

Depuis quelque jours j'étais occupé a essayé de comprendre comment fonctionne redis - avec docker

-> D'abord j'ai créé un container redis, car il fonctionne sur linux originellement
donc le mettre sur docker aide a être dans ce type d'environnement
-> Je suis actuellement sur la connexions des données api à redis

Mes bugs principaux étaient que le dns interne de docker ne se connectaient par à celui du backend
j'ai appris que docker mappais naturellement les services si on décrivait le nom

J'ai rajouté un réseau privé : "appnet" 
dans networks qui est parfait pour connecter redis et le backend, ils ont un réseaux privés ou ils peuvent se connecter

et ça fonctionne

-> Maintenant il faut que je fasse un cache pour open alex qui dure 30 jours, avec suppression par "moins utilisés",
et qui ressortes quand on en a besoin X

**ça fonctionne - le système de redis** : 

-> On va faire un gigantesque appel la première fois, et ensuite on tri et on ne ressort que quelques articles
chaque semaine lorsque les articles ont dépassés leurs intérets on les remplaces par un nouvel appel

-> Le temps de refresh est magnifique

**Prochaine étapes**

-> Vérifier que le refresh marche bien - regarder la configuration de redis (préinstallé) pour éviter les problèmes

**----------------------------------06-02----------------------------------**

liens utile pour la conceptions instagram
https://read.learnyard.com/high-level-design/hld-instagram-system-design/#:~:text=In%20reality%2C%20Instagram%20uses%20PostgresSQL,built%20a%20custom%20sharding%20solution.

-> Pour plus tard : un load balancer - elasticsearch - docker swarm
-> Rajout de rabbit mq, pour la livraison petit a petit

-> Aujourd'hui, je rajoute une fonctionnalité "favorite" qui a sa table, quand un utilisateur ajoutes en favoris ses articles 
il le pousse dans cette table avec user id - article id, qui est rappelons le dans le cache pendant 30 jours
Si le cache se supprime alors que l'utilisateur veux y réaccéder, je refetch


**----------------------------------10-02----------------------------------**

-> Bug sur l'authentification - mots de passe a mettre quand on s'inscris avec google
-> Faire la gestion du cache
-> Pourquoi les images ne ressortent pas ?

**----------------------------------12-02----------------------------------**

-> Bug sur l'authentification - mots de passe a mettre quand on s'inscris avec google
-> Faire la gestion du cache
-> Pourquoi les images ne ressortent pas ?