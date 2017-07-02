# olsnet

This repository is intended to be the core project for Our Life Stories.net.
It implements a container-based web application that has persistence via a 
MySQL container, a RESTful API implemented as a Python service, and an HTML5
UI implemented using React, React-Router 4, and Redux, assmebled with webpack.

## Project Structure

* **bin** - Contains scripts that are useful for the project as a whole
* **client** - Contains the source for the HTML5 client app and tests
* **logs** - Consolidated logs from the server
* **mysql-data** - Persistent data volume for development instance of mysql
* **openapi** - API documentation for the RESTful API
* **proxy** - Contains configuration files for the web proxy service
* **server** - Source for the server, including tests. This is a virtualenv directory
* **web** - Home directory for the development web service

## Docker Environment

This project is designed to support development via Docker, it uses
docker-compose to create three containers; one database container, 
one application server container, and one web container. The server
code executes in the application server container, and the web container
both serves the HTML5 UI and acts as a proxy for the application server.

The olsnet-dev and olsnet-test scripts in /bin are intended to set up the
environment for docker; the docker-compose.yml depends on the environment
variables in these scripts being set. The development scripts are intended
to allow work with a persistent database instance; the test scripts are
intended to work along with the bin/testme script to allow repeated automated
testing on a clean database.

All scripts in bin assume the current working directory is the project root.
To start the development instance:

    source bin/olsnet-dev; docker-compose up

If you use the above syntax, you'll need to stop the services the same way:

    source bin/olsnet-dev; docker-compose stop

## Code Splitting

The application also demonstrates code splitting with dynamic module loading.
With the various third party code libraries, the total volume of code is
getting large, so this uses both code splitting defined by the application
source (using System.import and promises) as well as by webpack plugins.

## Internationalization

The application also demonstrates how to handle at least translation using
react-intl. It leverages the react-intl babel plugins to dynamically generate
translation files through extraction of tranlation elements from source

## API First Development

This application also demonstrates some components of API first development.
The python REST API server is built using the Connexion project, which 
dynamically maps an OpenAPI 2.0 specification from YAML to Python. So adding
new APIs or changing existing APIs starts with modifying the spec, and then
writing the Python code. I have not yet found a useful way to dynamically
integrated a Redux app via API spec parsing, so the client API consumption
is generated manually.

## Code coverge for unit & integration tests

This application includes extensive code coverage for both server and client.
The testme script can generate server and client coverage in a single run,
and include integration tests where the client data model is making actual
API calls rather than just using mocking

## Modern Authentication

Provides JWT based authentication that includes CSRF protection, and user
identification persistence across application reload / browser restart.
