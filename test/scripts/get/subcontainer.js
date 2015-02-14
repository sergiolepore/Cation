var expect = require('chai').expect
var Cation = require('../../../index.js')

describe('Working with subcontainers:', function() {
  it('should register and retrieve foo:bar using a subcontainer', function(done) {
    var container = new Cation()

    container.register('foo:bar', 'bar value', { type: 'static' })

    var subcontainerPromises = [
      container.get('foo:bar'),
      container.getSubcontainer('foo').get('bar')
    ]

    expect(
      Promise.all(subcontainerPromises)
    ).to.eventually.eql(
      ['bar value', 'bar value']
    ).notify(done)
  })

  it('should not retrieve invalid subcontainer resources', function(done) {
    var container = new Cation()

    container.register('foo:bar', 'bar value', { type: 'static' })

    expect(
      container.get('foo:baz')
    ).to.be.rejectedWith(
      '"baz" resource not found'
    ).notify(done)
  })

  it('should retrieve foo:bar even if it was registered progratically', function(done) {
    var mainContainer = new Cation()
    var subcontainer  = new Cation({ id: 'foo' })

    subcontainer.register('bar', 'bar value', { type: 'static' })

    mainContainer.attachSubcontainer(subcontainer)

    var subcontainerPromises = [
      mainContainer.get('foo:bar'),
      mainContainer.getSubcontainer('foo').get('bar')
    ]

    expect(
      Promise.all(subcontainerPromises)
    ).to.eventually.eql(
      ['bar value', 'bar value']
    ).notify(done)
  })

  it('should resolve dependencies in subcontainers', function(done) {
    var container   = new Cation()
    var DemoService = function(barValue) {
      this.dependency = barValue
    }

    container.register('foo:bar', 'bar value', { type: 'static' })
    container.register('DemoService', DemoService, {
      args: ['@foo:bar']
    })

    container.get('DemoService').then(function(demoService) {
      expect(
        demoService.dependency
      ).to.be.equal('bar value')

      done()
    }).catch(done)
  })

  it('should check for resources in subcontainers', function(done) {
    var container = new Cation()

    container.register('foo:bar', 'baz', { type: 'static' })

    expect(
      container.has('foo:bar')
    ).to.be.equal(true)

    expect(
      container.has('foo:baz')
    ).to.be.equal(false)

    expect(
      container.has('bar:baz')
    ).to.be.equal(false)

    done()
  })

  it('should find tagged resources in subcontainers', function(done) {
    var mainContainer = new Cation()
    var subcontainer  = new Cation({ id: 'qux' })

    mainContainer.register('foo:bar', function() {}, { tags: ['something.tag', 'another.tag'] })
    mainContainer.register('foo:baz', function() {}, { tags: ['awesomeframework.core.boot', 'another.tag'] })
    mainContainer.register('bar', function() {}, { tags: ['awesomeframework.core.boot', 'another.tag'] })

    subcontainer.register('corge', function(){}, { tags: ['awesomeframework.core.boot'] })
    mainContainer.attachSubcontainer(subcontainer)

    var serviceIds = mainContainer.findTaggedResourceIds('awesomeframework.core.boot')

    expect(serviceIds).to.include('foo:baz')
    expect(serviceIds).to.include('bar')
    expect(serviceIds).to.include('qux:corge')
    expect(serviceIds).to.not.include('foo:bar')

    done()
  })
})
