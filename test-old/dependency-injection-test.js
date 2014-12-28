// dependency-injection-test.js

var vows = require('vows'),
assert = require('assert'),
Cation = require('../');

var services_json = {
  "parameters": {
    "encoding": "UTF8",
    "app": {
      "cation_dir": __dirname + '/..',
      "tests_dir": __dirname
    }
  },

  "services": {
    "eyes": {
      "require": "%app.cation_dir%/node_modules/vows/node_modules/eyes/lib/eyes.js",
      "build": false
    },

    "test.my_service": {
      "require": "%app.tests_dir%/test_module.js",
      "args": ["%encoding%", "@eyes"],
      "calls": {
        "check": [2012]
      }
    }
  }
};

// Start test unit...
vows.describe('Dependency Injection').addBatch({
  'when we set up the service container': {
    topic: function() {
      return new Cation(services_json.parameters, services_json.services);
    },
    'the container has the "eyes" service': function (container) {
      assert.isTrue(container.has('eyes'));
    },
    'and has my own service': function(container) {
      assert.isTrue(container.has('test.my_service'));
    }
  },
  'when the container is ready': {
    topic: function() {
      var container = new Cation(services_json.parameters, services_json.services);
      container.ready();

      return container;
    },
    'we can get the services': {
      'for example, the "eyes" service': function (container) {
        assert.isObject(container.get('eyes'));
      },
      'or my own service': function (container) {
        assert.isFunction(container.get('test.my_service'));
      }
    },
    'services have everything that was configured in the json schemas': function(container) {
      var my_srv = container.get('test.my_service');
      assert.equal(my_srv.getEncoding(), 'UTF8');
    }
  }
}).export(module);