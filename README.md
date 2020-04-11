# rufs-crud-es6

Restful Utilities for Full Stack - CRUD WebApp

You need NodeJs installed and PostgreSql server already running with your database.

Requires NodeJs version >= 9.1

Requires browser with support to dynamic ES6 modules (tested with Chrome versions >= 64)

## First Step

Open terminal and clone this repository with `git clone https://github.com/alexsandrostefenon/rufs-crud-es6`.

To download the required dependencies then

`npm install ./rufs-crud-es6` 

or

`yarnpkg install --cwd ./rufs-crud-es6 --modules-folder $NODE_MODULES_PATH`

where $NODE_MODULES_PATH point to your desired node_modules folder destination.

### Run Ecosystem

expose database information, like :

export PGHOST=localhost;
export PPORT=5432;
export PGDATABASE=<database name>;
export PGUSER=<database user>;
export PGPASSWORD=<database password>;

#execute rufs-proxy to load and start minimal microservices :

nodejs --inspect --experimental-modules --loader $NODE_MODULES_PATH/rufs-base-es6/custom-loader.mjs $NODE_MODULES_PATH/rufs-crud-es6/proxy.js;

## Web application

In ES6 compliance browser open url

`http://localhost:8080/crud`

For custom service configuration or user edition, use user 'admin' with password 'admin'.
