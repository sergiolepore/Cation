var expect = require('chai').expect
var Cation = require('../../../index.js')

var ResourceNotFoundError = Cation.ResourceNotFoundError

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
    }).catch(done)
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
    }).catch(done)
  })
})

describe('Retrieving invalid services:', function() {
  it('should return an error if trying to `get` an unknown resource', function(done) {
    var container  = new Cation()
    var resourceId = 'unknown-service'

    expect(
      container.get(resourceId)
    ).to.be.rejectedWith(
      ResourceNotFoundError,
      '"'+resourceId+'" resource not found'
    ).notify(done)
  })
})

describe('Working with tagged resources:', function() {
  it('should find resource IDs with a given tag', function(done) {
    var container = new Cation()

    container.register('Demo1', function() {}, { tags: ['something.tag', 'another.tag'] })
    container.register('Mailer', function() {}, { tags: ['awesomeframework.core.boot', 'another.tag'] })
    container.register('View', function() {}, { tags: ['awesomeframework.core.boot', 'another.tag'] })

    var serviceIds = container.findTaggedResourceIds('awesomeframework.core.boot')

    expect(serviceIds).to.include('Mailer')
    expect(serviceIds).to.include('View')
    expect(serviceIds).to.not.include('Demo1')

    done()
  })
})
