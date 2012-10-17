## About Cation

Node.js Service Container

[![Build Status](https://travis-ci.org/sergiolepore/cation.png?branch=master)](https://travis-ci.org/sergiolepore/cation)

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


## License

    Copyright (c) 2012, Sergio Daniel Lepore
    All rights reserved.

    Redistribution and use in source and binary forms, with or without
    modification, are permitted provided that the following conditions are met:
        * Redistributions of source code must retain the above copyright
          notice, this list of conditions and the following disclaimer.
        * Redistributions in binary form must reproduce the above copyright
          notice, this list of conditions and the following disclaimer in the
          documentation and/or other materials provided with the distribution.
        * Neither the name of the Sergio Daniel Lepore nor the
          names of its contributors may be used to endorse or promote products
          derived from this software without specific prior written permission.

    THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
    ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
    WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
    DISCLAIMED. IN NO EVENT SHALL SERGIO DANIEL LEPORE BE LIABLE FOR ANY
    DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
    (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
    LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
    ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
    (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
    SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

    ================================================================================

    This software consists of voluntary contributions made by individuals and a 
    group of developers who take part in Moobin (tm) organization and is licensed 
    under BSD-3 Licence.