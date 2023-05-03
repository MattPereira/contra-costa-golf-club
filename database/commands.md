# How to grab a backup of the database from railway

### To dump prod database from railway into file
`pg_dump -U postgres -h containers-us-west-43.railway.app -p 7601 -W -F p railway > latest.dump`

### To pass data from dump file into empty local database
`psql -d ccgc_railway -f latest.dump`

- When to use the pg_restore command??


# DOCKER DUMP FILE SETUP

1. GET DUMP FILE INTO DOCKER CONTAINER ( MUST BE IN SAME DIRECTORY AS DUMP FILE )
    - `docker cp prod.dump container_id:/prod.dump`

2. USE DUMP FILE TO POPULATE DATABASE (RUN INSIDE DOCKER CONTAINER TERMINAL )
    - `psql -U postgres -d golf-db -f prod.dump`