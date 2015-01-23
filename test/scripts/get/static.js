var expect = require('chai').expect
var Cation = require('../../../index.js')

describe('User-defined `static` resources:', function() {
  it('should act as constants inside the container', function(done) {
    var container = new Cation();
    var value     = 'dd6cb472-4324-4439-9a1b-417d6f812002'

    container.register('static-value', value, {
      type: 'static'
    })

    container.get('static-value').then(function(retrievedValue) {
      expect(
        retrievedValue
      ).to.be.equal(value)

      done()
    }).catch(function(error) {
      done(error)
    })
  })
})
