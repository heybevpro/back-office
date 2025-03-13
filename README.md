<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456

[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">Backend application for BevPro built with <a href="https://github.com/nestjs/nest"> NestJS</a>, featuring REST APIs, database integration, authentication, and microservices support. <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
</p>

## Description

The Back Office for the BevPro system. Serves as a REST client which talks to a database and serves requests.

## Installing Dependencies

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Guidelines

All pull requests must adhere to the following guidelines.

### Branching Rules:

- Branches are categorized into feature, task, bug, and release.
  Every branch must be created from the latest main branch.
  Branch names must follow the format:
  `feature/<JIRA_ID>/some-feature`, `task/<JIRA_ID>/some-task`, or `bug/<JIRA_ID>/some-bug`.
- Commit messages must begin with the JIRA Ticket ID, followed by a brief description. Example:
    - `JIRA-123: fix-login-issue`
    - `JIRA-456: add-user-profile-feature`
- Ensure pre-commit hooks are working

### Making Database Changes:

To make any changes to the database, you must create
a [migration](https://docs.nestjs.com/techniques/database#migrations). A migration is just a single file
with sql queries to update a database schema and apply new changes to an existing database.

- All migrations must be included with the corresponding feature changes and committed to version control.
- To modify the database, create a migration script using the `migration:create` script in `package.json`. You need to
  pass a name for your migration when you run this script, like:

```bash
npm run migration:create --migration_name=<JIRA-ID>__AddingNewColumnForABC
```

- This will create a migration file named: `<TIMESTAMP>-<JIRA-ID>__AddingNewColumnForABC.ts`
- Ensure the generated migration script is located in the `/migrations` directory.
- Once generated, add the necessary changes to the migration file.

### Running the Migrations:

Migrations can be applied in two ways:

- Manually: Run the migration script from `package.json`:

``` bash
npm run migrations:run
```

- Automatically: Restart the application, which executes all migrations in the `/migrations` directory in their creation
  order when the back office loads.

## Local Testing Setup

We use `docker compose` to run the application locally. Follow the steps below to run the application for QA and
integration testing.

- Based on your system and environment install [Docker Desktop](https://docs.docker.com/desktop/): v4.37.2+
- Ensure Docker Daemon is running
- Make sure you have the .env file in the root directory of the project. If not, create one with the content provided in
  `.env.example`:

- Run the following command to start the application and spawn the database:

```bash
docker compose up
```

- Verify the following 2 services are running on Docker Desktop:
    1. bevpro_server
    2. bevpro_db

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- Checkout the [TypeORM Documentation](https://typeorm.io/) for information on writing CRUD routines.
- Migrations with [TypeORM](https://typeorm.io/migrations#how-migrations-work)