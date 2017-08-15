Usage
=====

instructions for v0.2

Production
----------

Clone KMS repo

::

    sudo apt install yarn nohup
    cp ./server/config_example.json ./server/config.json

Edit config file

::

    export NODE_ENV=PRODUCTION
    yarn install
    yarn build
    nohup yarn start &

Development
-----------

Run this for first installation only once Clone KMS repo

::

    yarn install

Run to start development server

::

    yarn run dev

Run tests
---------

::

    NODE_ENV=TEST mocha test
