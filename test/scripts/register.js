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
      container.register.bind(container)
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
    var serviceArgs // nothing to bind. no problem

    expect(
      container.register.bind(container, resourceId, DemoService, serviceArgs, options)
    ).to.throw(
      `Unknown type: "${options.type}"`
    )

    done()
  })

  it('should not throw an error if `type` is valid', function(done) {
    var resourceId  = 'resource-id'
    var options     = { type: 'static' }
    var serviceArgs // nothing to bind. no problem

    expect(
      container.register.bind(container, resourceId, DemoService, serviceArgs, options)
    ).to.not.throw(
      `Unknown type: "${options.type}"`
    )

    done()
  })

  it('should throw an error if trying to register a resource twice', function(done) {
    var resourceId = 'resource-id'

    container.register(resourceId, DemoService)

    expect(
      container.register.bind(container, resourceId, DemoService)
    ).to.throw(
      `There's already a resource registered as "${resourceId}"`
    )

    done()
  })

  it('should register a resource as `service`', function(done) {
    var serviceId = 'resource-id'

    container.register(serviceId, DemoService, null, {
      type: 'service'
    })

    expect(
      container.has(serviceId)
    ).to.be.equal(true)

    done()
  })

  it('should register a resource as `factory`', function(done) {
    var factoryId = 'resource-id'

    container.register(factoryId, DemoService, null, {
      type: 'factory'
    })

    expect(
      container.has(factoryId)
    ).to.be.equal(true)

    done()
  })

  it('should register a resource as `decorator`', function(done) {
    var decoratorId = 'resource-id'

    container.register(decoratorId, DemoService, null, {
      type: 'decorator'
    })

    expect(
      container.has(decoratorId)
    ).to.be.equal(true)

    done()
  })

  it('should register a resource as `static`', function(done) {
    var staticId = 'resource-id'

    container.register(staticId, DemoService, null, {
      type: 'static'
    })

    expect(
      container.has(staticId)
    ).to.be.equal(true)

    done()
  })
})
