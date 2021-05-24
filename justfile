# Path to backend_folder
app_name := "waragainstcovid-backend"
backend_folder := "/home/waragainstcovid/waragainstcovid-backend"
default_branch := "master"

# Pull the latest backend
pull-backend:
	#!/usr/bin/env bash
	cd "{{backend_folder}}" && git checkout "{{default_branch}}" && git pull

# Setup the dependencies for all the microservices.
setup-backend: pull-backend
	#!/usr/bin/env bash
	cd "{{backend_folder}}" && yarn install

# Run the linting for all microservices
lints: setup-backend
	#!/usr/bin/env bash
	cd "{{frontend_folder}}" && yarn lint
	cd "../{{backend_folder}}" && yarn lint

# Build the application for production.
build-prod: setup-backend
	#!/usr/bin/env bash
	cd "{{backend_folder}}" && yarn build

# Run the servers in production mode.
run-prod: build-prod
	#!/usr/bin/env bash
	cd "{{backend_folder}}" && pm2 start yarn --interpreter bash --name "{{app_name}}" -- start # yarn start