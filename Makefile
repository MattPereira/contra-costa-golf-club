-include .env

.PHONY: dump-prod-db populate-locale-db

dump-prod-db:
	PGPASSWORD=$(PG_PASSWORD) pg_dump -U postgres -h containers-us-west-43.railway.app -p 7601 -F c railway > prod.dump

populate-local-db:
	@echo "Dropping old database..."
	psql -c "DROP DATABASE IF EXISTS ccgc;"
	@echo "Creating new database..."
	psql -c "CREATE DATABASE ccgc;"
	@echo "Populating new database from dump..."
	pg_restore -U postgres -d ccgc prod.dump

# Copy dump file into docker container
docker-dump-db:
	docker cp prod.dump container_id:/prod.dump

# Restore dump file from within docker container (need to modify with docker exec command)
populate-docker-db:
	psql -U postgres -d ccgc_db -f prod.dump