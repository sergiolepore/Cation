Change ASAP:

    "test.my_service": {
      "require": "%app.apps_dir%/Moobin/config/test.js",
      "args": ["%encoding%", "@swig"],
      "calls": {
        "check": [8887]
      }
    }

change into:

    "test.my_service": {
      "require": "%app.apps_dir%/Moobin/config/test.js",
      "args": ["%encoding%", "@swig"], #argument of constructor
      "calls": { #this methods will be executed in order...
        "first_call": [],
        "second_call": ['param'],
        "third": [],
        "fourth": {
          "args": ["args"],
          "build_as": "another.service"
        } 
      },
      "build": {
        "builder_method": ['args'] #this method is the last one executed and has to return the final service. many developers use this technique (in old versions of Express, express.createServer() was the last one before service)
      }
    }


above implementation allows to do the following:

    {
      "parameters": {
        "server.host": "127.0.0.1",
        "server.port": 3001
      },

      "services": {
        "express": {
          "require": "express",
          "calls": {
            "createServer": {
              "build_as": "express.app"
            }
          }
        },

        "io": {
          "require": "socket.io",
          "build": {
            "listen": ["@express.app"]
          }
        },

        "redis": {
          "require": "redis"
        }
      }
    }


/// ---------

    var app = container.get('express.app');
    var express = container.get('express');



/// ---------

Service bag will contain:

"express": { //namespace global
  "require":...
  "app": object //y aca se van attacheando las cosas
}

eso es para @express.app - @express.require etc etc