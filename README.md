# olsnet

This repository is intended to be the core project for Our Life Stories.net.
It implements a container-based web application that has persistence via a 
MySQL container, a RESTful API implemented as a Python service, and an HTML5
UI implemented using React, React-Router, and Redux, assmebled with webpack.

#Project Structure

* **bin** - Contains scripts that are useful for the project as a whole
* **client** - Contains the source for the HTML5 client app
* **cover** - Code coverage from automated tests
* **coverage** - Code coverage from automated tests (one of these needs to go)
* **logs** - Consolidated logs from the server
* **mysql-data** - Persistent data volume for development instance of mysql
* **openapi** - API documentation for the RESTful API
* **proxy** - Contains configuration files for the web proxy service
* **server** - Source for the server. This is a virtualenv directory
* **test** - Source for automated unit / integration tests
* **web** - Home directory for the development web service

#Docker Environment

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



