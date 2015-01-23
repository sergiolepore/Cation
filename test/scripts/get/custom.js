var expect = require('chai').expect
var Cation = require('../../../index.js')

var CustomProvider = require('./custom/provider.js')

describe('User-defined Providers:', function() {
  it('should register custom providers', function(done) {
    var container = new Cation()

    container.addProvider('custom', CustomProvider)

    container.register(
      'something',
      'hello',
      { type: 'custom' }
    ).then(function() {
      return container.get('something')
    }).then(function(resource) {
      expect(
        resource
      ).to.be.equal('hello')

      return resource
    }).then(function() {
      return container.get('customresolver-value')
    }).then(function(resource2) {
      expect(
        resource2
      ).to.be.equal('Hi! I\'m a value stored by the custom resolver')

      done()
    }).catch(function(error) {
      done(error)
    })
  })
})
