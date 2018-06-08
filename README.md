# Pinclone: FreeCodeCamp Project 
Pinterest Functionality Clone

See the app running [here](https://fcc-pin-clone.herokuapp.com/).

## Overview

Pinclone is a fullstack JavaScript implementation of the Pinterest website utilizing PostgreSQL, Express, Node.js and NGINX via Heroku deployment. Fufilling the FreeCodeCamp project requirements:

* Pinclone allows users to login with their Twitter account.
* Users can link images to their account, or delete those images.
* A Pinterest-style wall is displayed containing all images a user's linked to or "liked" from other users.
* One can browse other users' walls of images by clicking a specific user's icon.
* Upon a user linking an image to their account, the Node.js server checks that the image link is not broken, and if so, replaces the image with a placeholder image.

## Quick Start Guide

### Prerequisites

In order to use Pinclone, you must have the following installed:

- [Node.js](https://nodejs.org/)
- [NPM](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Heroku CLI](https://devcenter.heroku.com/articles/heroku-cli)(optional)
- [PGAdmin](https://www.pgadmin.org/) (optional)

### Installation & Startup

**Clone GitHub Repo**

```bash
$ git clone https://github.com/CLClark/pinclone.git your-project
```

This will install the Pinclone components into the `your-project` directory.

### Heroku Setup

To enable NGINX to act as proxy server on your Heroku dyno,
add the following Buildpack: 
https://github.com/CLClark/heroku-buildpack-nginx.git

Also, you will need to set the following environmental variables in your Heroku dyno with:

```
heroku config:set KEY=VALUE
```
* ZOO_COOKIE_SECRET (create a server-side secret hash for session management)
* API_KEY (from your Twitter app credentials)
* TWITTER_SECRET(from your Twitter app credentials)
* APP_URL (ex: https://my-heroku-dyno.herokuapp.com)
* ```PGSSLMODE=require```
* DATABASE_URL (your PostgreSQL single line access URL; includes username, password, database url, etc.)
* LOCAL = ('true' if you are running on localhost instead of heroku, otherwise: false )

If you are running this app locally instead of Heroku, save these to your server's .env file.

### Twitter Setup
coming...

### PostgreSQL Setup

Use the SQL statements within [postgres-sql.sql](postgres-sql.sql), substituting your own username to create the required tables:
* likes
* pins
* ownership
* users
* session

and trigger functions:
* initlike
* tsv_trigger

Pinclone also requires the [pgcrypto](https://www.postgresql.org/docs/current/static/pgcrypto.html) PostgreSQL module, be sure to install or add it to your PostgreSQL instance.

### Contributing

This is an open-source project to fufill FreeCodeCamp project requirements, contributions are welcome, simply send me a note on Github.

### Tutorial

You can find a complete step-by-step tutorial on how to create this app from the ground up [here]().

## Authors

* **Chris L Clark ** - *Initial work* - [CLClark](https://github.com/CLClark/)

## License

Apache License 2.0. [Click here for more information.](LICENSE.md)
