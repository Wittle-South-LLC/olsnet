# olsnet

This repository is intended to be the core project for Our Life Stories.net.
It implements a container-based web application that has persistence via a 
MySQL container, a RESTful API implemented as a Python service, and an HTML5
UI implemented using React, React-Router, and Redux, assmebled with webpack.

Project Structure

* **bin** - Contains scripts that are useful for the project as a whole
* **client** - Contains the source for the HTML5 client app
* **conf** - Configuration files for the web server service
* **cover** - Code coverage from automated tests
* **coverage** - Code coverage from automated tests (one of these needs to go)
* **logs** - Consolidated logs from the server
* **mysql-data** - Persistent data volume for development instance of mysql
* **openapi** - API documentation for the RESTful API
* **server** - Source for the server. This is a virtualenv directory
* **test** - Source for automated unit / integration tests
* **web** - Home directory for the development web service

