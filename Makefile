-include .env

.PHONY: dump-prod-db populate-locale-db

dump-prod-db:
	@PGPASSWORD="$(PGPASSWORD)" pg_dump -U "$(PGUSER)" -h "$(PGHOST)" -p "$(PGPORT)" -F c --schema=public "$(PGDATABASE)" > prod.dump

populate-local-db:
	@echo "Dropping old database..."
	psql -d postgres -c "DROP DATABASE IF EXISTS ccgc;"
	@echo "Creating new database..."
	psql -d postgres -c "CREATE DATABASE ccgc;"
	@echo "Populating new database from dump..."
	pg_restore --clean --if-exists --no-owner --no-acl -d ccgc prod.dump

# Copy dump file into docker container
docker-dump-db:
	docker cp prod.dump container_id:/prod.dump

# Restore dump file from within docker container (need to modify with docker exec command)
populate-docker-db:
	psql -U postgres -d ccgc_db -f prod.dump
