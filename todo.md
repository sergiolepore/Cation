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
    "third": []
  },
  "build": {
    "builder_method": ['args'] #this method is the last one executed and has to return the final service. many developers use this technique (in old versions of Express, express.createServer() was the last one before service)
  }
}