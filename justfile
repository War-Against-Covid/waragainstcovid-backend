# Path to backend_folder
app_name := "waragainstcovid-backend"
default_branch := "master"

# Setup the dependencies for all the microservices.
setup-backend:
	#!/usr/bin/env bash
    yarn install --prod

# Build the application for production.
build-prod: setup-backend
	#!/usr/bin/env bash
    yarn build

# Run the servers in production mode.
run-prod: build-prod
	#!/usr/bin/env bash
    pm2 start yarn --interpreter bash --name "{{app_name}}" -- start # yarn start