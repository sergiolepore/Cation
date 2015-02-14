var chai   = require('chai')
var expect = chai.expect
var Cation = require('../../index.js')

describe('Register a resource on the container:', function(){
  var container
  var DemoService

  beforeEach(function() {
    container   = new Cation()
    DemoService = function() {}
  })

  it('should throw an error if no `id` is provided', function(done) {
    expect(
      container.register
    ).to.throw(
      '`id` is required'
    )

    done()
  })

  it('should not throw an error if `id` is provided', function(done) {
    var resourceId = 'resource-id'

    expect(
      container.register.bind(container, resourceId)
    ).to.not.throw(
      '`id` is required'
    )

    done()
  })

  it('should throw an error if no `resource` is provided', function(done) {
    var resourceId = 'resource-id'

    expect(
      container.register.bind(container, resourceId)
    ).to.throw(
      '`resource` is required'
    )

    done()
  })

  it('should not throw an error if `resource` is provided', function(done) {
    var resourceId = 'resource-id'

    expect(
      container.register.bind(container, resourceId, DemoService)
    ).to.not.throw(
      '`resource` is required'
    )

    done()
  })

  it('should throw an error if `type` is not valid', function(done) {
    var resourceId  = 'resource-id'
    var options     = { type: 'InvalidType' }

    expect(
      container.register.bind(container, resourceId, DemoService, options)
    ).to.throw(
      'Unknown type: "'+options.type+'"'
    )

    done()
  })

  it('should not throw an error if `type` is valid', function(done) {
    var resourceId  = 'resource-id'
    var options     = { type: 'static' }

    expect(
      container.register.bind(container, resourceId, DemoService, options)
    ).to.not.throw(
      'Unknown type: "'+options.type+'"'
    )

    done()
  })

  it('should throw an error if trying to register a resource twice', function(done) {
    var resourceId = 'resource-id'

    container.register(resourceId, DemoService)

    expect(
      container.register.bind(container, resourceId, DemoService)
    ).to.throw(
      'There\'s already a resource registered as "'+resourceId+'"'
    )

    done()
  })

  it('should register a resource as `service`', function(done) {
    var serviceId = 'resource-id'

    container.register(serviceId, DemoService, {
      type: 'service'
    })

    expect(
      container.has(serviceId)
    ).to.be.equal(true)

    done()
  })

  it('should register a resource as `factory`', function(done) {
    var factoryId = 'resource-id'

    container.register(factoryId, DemoService, {
      type: 'factory'
    })

    expect(
      container.has(factoryId)
    ).to.be.equal(true)

    done()
  })

  it('should register a resource as `static`', function(done) {
    var staticId = 'resource-id'

    container.register(staticId, DemoService, {
      type: 'static'
    })

    expect(
      container.has(staticId)
    ).to.be.equal(true)

    done()
  })

  it('should store singleton resources', function(done) {
    container.register('SingletonService', DemoService, {
      singleton: true
    })

    container.get('SingletonService').then(function(service) {
      service.newProperty = 'Hi! I\'ll be here forever :)'

      return container.get('SingletonService')
    }).then(function(service) {
      expect(
        service.newProperty
      ).to.be.equal('Hi! I\'ll be here forever :)')

      done()
    }).catch(done)
  })

  it('should not store non singleton resources', function(done) {
    container.register('NonSingletonService', DemoService)

    container.get('NonSingletonService').then(function(service) {
      service.newProperty = 'Hi... I\'ll not last forever :('

      return container.get('NonSingletonService')
    }).then(function(service) {
      expect(
        service.newProperty
      ).to.not.be.equal('Hi... I\'ll not last forever :(')

      expect(
        service.newProperty
      ).to.be.equal(undefined)

      done()
    }).catch(done)
  })
})
