Cation
======

Node.js Dependency Container

Usage
-----

`var cation = require('cation')(__dirname, { 'ejs': 'ejs', 'my_module': './app/my_stuff/module.js' } );
var ejs = cation.get('ejs');
var my_mod = cation.get('my_module');`