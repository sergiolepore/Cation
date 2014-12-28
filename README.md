## About Cation

Node.js Service Container


[![Build Status](https://travis-ci.org/sergiolepore/Cation.png?branch=master)](https://travis-ci.org/sergiolepore/Cation)

## Install

    npm install cation

## Usage

    var services_json = {
      "parameters": {
        "encoding": "UTF8",
        "app.root_dir": __dirname,
        "app.apps_dir": __dirname + '/app'
      },

      "services": {
        "swig": {
          "require": "swig"
        },

        "jade": {
          "require": "jade"
        },

        "io": {
          "require": "socket.io"
        },

        "test.my_service": {
          "require": "%app.apps_dir%/Moobin/config/test.js",
          "args": ["%encoding%", "@swig"],
          "calls": {
            "check": [8887]
          }
        }
      }
    };
