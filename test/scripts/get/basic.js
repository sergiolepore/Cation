var expect = require('chai').expect
var Cation = require('../../../index.js')

describe('Container as a service:', function() {
  it('should return the same container on `get(\'container\')`', function(done) {
    var originalContainerId = 'container-id'
    var originalContainer   = new Cation({
      id : originalContainerId
    })

    originalContainer.get('container').then(function(retrievedContainer) {
      expect(
        retrievedContainer.getId()
      ).to.be.equal(originalContainerId)

      done()
    }).catch(function(error) {
      done(error)
    })
  })

  it('should return the container reference on `get(\'container\')`', function(done) {
    var originalContainer = new Cation()

    originalContainer.get(
      'container'
    ).then(function(retrievedContainer) {
      retrievedContainer.register('static-string', 'Lorem Ipsum Value', {
        type : 'static'
      })
    }).then(function() {
      return originalContainer.get('static-string')
    }).then(function(staticString) {
      expect(
        staticString
      ).to.be.equal('Lorem Ipsum Value')

      done()
    }).catch(function(error) {
      done(error)
    })
  })
})

describe('Retrieving invalid services:', function() {
  it('should return an error if trying to `get` an unknown resource', function(done) {
    var container  = new Cation()
    var resourceId = 'unknown-service'

    expect(
      container.get(resourceId)
    ).to.be.rejectedWith(
      '"'+resourceId+'" resource not found'
    ).notify(done)
  })

  // it('should return an error if the resource has a circular dependency (1)', function(done) {
  //   var container   = new Cation()
  //   var resourceId1 = 'Service1'
  //   var resourceId2 = 'Service2'
  //
  //   var Service1 = function() {}
  //   var Service2 = function() {}
  //
  //   container.register(resourceId1, Service1, { args: ['@'+resourceId2] })
  //   container.register(resourceId2, Service2, { args: ['@'+resourceId1] })
  //
  //   var getPromise = container.get(resourceId1)
  //
  //   expect(
  //     getPromise
  //   ).to.be.rejectedWith(
  //     'Error loading "'+resourceId1+'". Circular reference detected'
  //   ).notify(done)
  // })
  //
  // it('should return an error if the resource has a circular dependency (2)', function(done) {
  //   var container   = new Cation()
  //   var resourceId  = 'Service'
  //   var Service     = function() {}
  //
  //   container.register(resourceId, Service, { args: ['@'+resourceId] })
  //
  //   var getPromise = container.get(resourceId)
  //
  //   expect(
  //     getPromise
  //   ).to.be.rejectedWith(
  //     'Error loading "'+resourceId+'". Circular reference detected'
  //   ).notify(done)
  // })
})
