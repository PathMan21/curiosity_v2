_RAPPEL : FRONT END_

`npm run frontend:dev`

_RAPPEL : BACKEND_

`npm run dev`

_Maintenant avec docker_

`docker compose up --build`

`docker compose exec mariadb mysql -uroot -proot -e "DROP DATABASE IF EXISTS db_curiosity; CREATE DATABASE db_curiosity;"`


_Pour gérer redis via docker_

`docker exec -it redis redis-cli`
`KEYS *` pour lister le cache
`FLUSHALL` pour retirer le cache 