Cation
======

Node.js Dependency Container

Usage
-----
    
    var dir_aliases = {
      root_dir: __dirname,
      www_dir: 'var/www'
    }

    var modules = { 
      ejs: 'ejs', 
      my_module: ':root_dir/app/my_stuff/module.js', 
      another_module: ':www_dir/project/module.js' 
    }

    var cation = require('cation')(dir_aliases, modules );  
    
    var ejs = cation.get('ejs'),
        my_mod = cation.get('my_module'),
        another = cation.get('another_module');

Changelog
---------

0.2.0:
* Added support for parameters on module paths