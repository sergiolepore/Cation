var expect = require('chai').expect
var Cation = require('../../../index.js')

describe('User-defined `service` resources:', function() {
  it('should apply static dependencies', function(done) {
    var container   = new Cation()
    var serviceId   = 'DemoService'
    var serviceArgs = ['Sergio', 'Lepore', 24, 'Cation']

    var Service = function(name, lastname, age, project) {
      this.sayHello = function() {
        return '%name% %lastname% is %age% years old. He\'s working on %project% right now.'
          .replace(/%name%/, name)
          .replace(/%lastname%/, lastname)
          .replace(/%age%/, age)
          .replace(/%project%/, project)
      }
    }

    container.register(serviceId, Service, { args: serviceArgs })

    container.get(serviceId).then(function(service) {
      expect(
        service.sayHello()
      ).to.be.equals(
        'Sergio Lepore is 24 years old. He\'s working on Cation right now.'
      )

      done()
    }).catch(function(error) {
      done(error)
    })
  })

  it('should apply registered services as dependencies', function(done) {
    var container    = new Cation()

    var Service1 = function(name, lastname, age, project) {
      this.sayHello = function() {
        return '%name% %lastname% is %age% years old. He\'s working on %project% right now.'
        .replace(/%name%/, name)
        .replace(/%lastname%/, lastname)
        .replace(/%age%/, age)
        .replace(/%project%/, project.getName())
      }
    }

    var Service2 = function(name) {
      this.getName = function() {
        return name
      }
    }

    container.register('Service1', Service1, { args: ['Sergio', 'Lepore', 24, '@Service2'] })
    container.register('Service2', Service2, { args: ['Cation'] })

    container.get('Service1').then(function(service) {
      expect(
        service.sayHello()
      ).to.be.equals(
        'Sergio Lepore is 24 years old. He\'s working on Cation right now.'
      )

      done()
    }).catch(function(error) {
      done(error)
    })
  })
})
