# Pinclone: FreeCodeCamp Project - Pinterest Functionality Clone

## Overview

Pinclone is a fullstack JavaScript implementation of the Pinterest website utilizing PostgreSQL, Express, Node.js and NGINX. Fufilling the FreeCodeCamp project requirements,
-Pinclone allows users to login with their Twitter account.
-Users can link images to their account, or delete those images.
-A Pinterest-style wall is displayed containing all images a user's linked to or "liked" from other users.
-One can browse other users' walls of images by clicking a specific user's icon.
-Upon a user linking an image to their account, the Node.js server checks that the image link is not broken, and if so, replaces the image with a placeholder image.

## Quick Start Guide

### Prerequisites

In order to use Pinclone, you must have the following installed:

- [Node.js](https://nodejs.org/)
- [NPM](https://nodejs.org/)
- [PostgreSQL](https://www.postgresql.org/)
- [Heroku CLI] (https://devcenter.heroku.com/articles/heroku-cli)
- [PGAdmin](https://www.pgadmin.org/) (optional)

### Installation & Startup

**Clone GitHub Repo**

```bash
$ git clone https://github.com/CLClark/pinclone.git your-project
```

This will install the Pinclone components into the `your-project` directory.

### Heroku Setup

To enable NGINX to act as proxy server,
add the following Buildpack to your Heroku dyno: https://github.com/CLClark/heroku-buildpack-nginx.git

## Contributing

This is an open-source project to fufill FreeCodeCamp project requirements, contributions are welcome. To see ways to contribute, please send me a note on Github.

### Tutorial

You can find a complete step-by-step tutorial on how to create this app from the ground up [here](...).

## Features

| Features           | Standard  | Angular   | FCC       |
|:---------          |:--------: |:--------: |:---------:|
| MongoDB            | _Yes_     | _Yes_     | _Yes_     |
| Express            | _Yes_     | _Yes_     | _Yes_     |
| AngularJS (1.x)    | _No_      | _Yes_     | _No_      |
| Node.js            | _Yes_     | _Yes_     | _Yes_     |
| Passport           | _No_      | _No_      | _Yes_     |
| Mongoose           | _No_      | _No_      | _Yes_     |

## License

MIT License. [Click here for more information.](LICENSE.md)
