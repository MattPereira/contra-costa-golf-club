# Backup database from railway on local machine

1.  Dump prod database from railway into file_name.dump

```
pg_dump -U postgres -h containers-us-west-43.railway.app -p 7601 -W -F c railway > prod.dump
```

2. Use dump file to populate local database ( must be empty )

```
psql -d ccgc_railway -f prod.dump
```


# Seed database inside docker container with dump file

1. Copy dump file into docker container ( from /database working directory )

```
docker cp prod.dump container_id:/prod.dump
```

1. Use dump file to populate container database ( run inside docker container terminal )

```
psql -U postgres -d ccgc_db -f prod.dump
```