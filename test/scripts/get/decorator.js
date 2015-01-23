var expect = require('chai').expect
var Cation = require('../../../index.js')

var CustomDecorators = require('./decorator/decorator.js')

describe('User-defined Decorators:', function() {
  it('should register custom decorators', function(done) {
    var container = new Cation()

    container.addDecorator('decoratorA', CustomDecorators.decoratorA)
    container.addDecorator('decoratorB', CustomDecorators.decoratorB)

    container.register(
      'service',
      function() { this.property = 'hi!' },
      { decorators: ['decoratorA', 'decoratorB'] }
    ).then(function() {
      return container.get('service')
    }).then(function(service) {
      expect(
        service.property
      ).to.be.equal('hi!')

      expect(
        service.propertyA
      ).to.be.equal('Hi! I\'m a new property from decoratorA')

      expect(
        service.propertyB
      ).to.be.equal('Hi! I\'m a new property from decoratorB')

      done()
    }).catch(function(error) {
      done(error)
    })
  })
})
