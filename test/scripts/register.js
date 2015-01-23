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

  it('should return an error if no `id` is provided', function(done) {
    expect(
      container.register()
    ).to.be.rejectedWith(
      '`id` is required'
    ).notify(done)
  })

  it('should not return an error if `id` is provided', function(done) {
    var resourceId = 'resource-id'

    expect(
      container.register(resourceId)
    ).to.not.be.rejectedWith(
      '`id` is required'
    ).notify(done)
  })

  it('should return an error if no `resource` is provided', function(done) {
    var resourceId = 'resource-id'

    expect(
      container.register(resourceId)
    ).to.be.rejectedWith(
      '`resource` is required'
    ).notify(done)
  })

  it('should not return an error if `resource` is provided', function(done) {
    var resourceId = 'resource-id'

    expect(
      container.register(resourceId, DemoService)
    ).to.not.be.rejectedWith(
      '`resource` is required'
    ).notify(done)
  })

  it('should return an error if `type` is not valid', function(done) {
    var resourceId  = 'resource-id'
    var options     = { type: 'InvalidType' }

    expect(
      container.register(resourceId, DemoService, options)
    ).to.be.rejectedWith(
      'Unknown type: "'+options.type+'"'
    ).notify(done)
  })

  it('should not return an error if `type` is valid', function(done) {
    var resourceId  = 'resource-id'
    var options     = { type: 'static' }

    expect(
      container.register(resourceId, DemoService, options)
    ).to.not.be.rejectedWith(
      'Unknown type: "'+options.type+'"'
    ).notify(done)
  })

  it('should return an error if trying to register a resource twice', function(done) {
    var resourceId = 'resource-id'

    container.register(resourceId, DemoService)

    expect(
      container.register(resourceId, DemoService)
    ).to.be.rejectedWith(
      'There\'s already a resource registered as "'+resourceId+'"'
    ).notify(done)
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
    }).then(function() {
      expect(
        container.has(factoryId)
      ).to.be.equal(true)

      done()
    }).catch(function(error) {
      done(error)
    })
  })

  it('should register a resource as `static`', function(done) {
    var staticId = 'resource-id'

    container.register(staticId, DemoService, {
      type: 'static'
    }).then(function() {
      expect(
        container.has(staticId)
      ).to.be.equal(true)

      done()
    }).catch(function(error) {
      done(error)
    })
  })
})
