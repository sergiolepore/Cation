var expect = require('chai').expect
var Cation = require('../../../index.js')

describe('User-defined `factory` resources:', function() {
  it('should return the result of the factory execution', function(done) {
    var container = new Cation()

    var Service = function(name, lastname, age, project) {
      this.sayHello = function() {
        return '%name% %lastname% is %age% years old. He\'s working on "%project%" right now.'
        .replace(/%name%/, name)
        .replace(/%lastname%/, lastname)
        .replace(/%age%/, age)
        .replace(/%project%/, project)
      }
    }

    container.register('name', 'J.J.', { type: 'static' })
    container.register('lastname', 'Abrams', { type: 'static' })
    container.register('age', 48, { type: 'static' })
    container.register('project', 'Star Wars: The Force Awakens', { type: 'static' })
    container.register('DemoFactory', function(containerDep) {
      var promisesArray = [
        containerDep.get('name'),
        containerDep.get('lastname'),
        containerDep.get('age'),
        containerDep.get('project')
      ]

      return Promise.all(promisesArray).then(function(serviceArgs) {
        serviceArgs.unshift(Service)

        var BoundService = Service.bind.apply(Service, serviceArgs)

        return new BoundService()
      })
    }, {
      type: 'factory'
    })

    container.get('DemoFactory').then(function(service) {
      expect(
        service.sayHello()
      ).to.be.equals(
        'J.J. Abrams is 48 years old. He\'s working on "Star Wars: The Force Awakens" right now.'
      )

      done()
    }).catch(done)
  })
})
