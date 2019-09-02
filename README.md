# rufs-crud-es6
Restful Utilities for Full Stack - CRUD WebApp

You need NodeJs installed and PostgreSql server already running with your database.

Requires NodeJs version >= 9.1

Requires browser with support to dynamic ES6 modules (tested with Chrome versions >= 64)

## First Step

Clone this repository and open terminal, changing path to local repository folder.

### Build

then `npm install` to download the required dependencies.

cd ..
ln -s ./rufs-base-es6/node_modules/rufs-base-es6 ./

### Run Ecosystem

expose database information, like :

export PGHOST=localhost;
export PPORT=5432;
export PGDATABASE=<<database name>>;
export PGUSER=<<database user>>;
export PGPASSWORD=<<database password>>;

execute rufs-proxy to load and start minimal microservices :

`nodejs --inspect --experimental-modules --loader ./rufs-base-es6/custom-loader.mjs ./rufs-crud-es6/proxy.js`

## Web application

In ES6 compliance browser open url

`http://localhost:8080/crud`

For custom service configuration or user edition, use user 'admin' with password 'admin'.
