Cation
======

Node.js Dependency Container

Usage
-----

    var cation = require('cation')({ root_dir: __dirname, www_dir: 'var/www' }, { ejs: 'ejs', my_module: ':root_dir/app/my_stuff/module.js', another_module: ':www_dir/project/module.js' } );  
    var ejs = cation.get('ejs');  
    var my_mod = cation.get('my_module');
    var another = cation.get('another_module');
