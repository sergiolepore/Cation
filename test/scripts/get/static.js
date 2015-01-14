var expect = require('chai').expect
var Cation = require('../../../index.js')

describe('User-defined Statics:', function() {
  it('should act as constants inside the container', function(done) {
    var container = new Cation();
    var value     = 'dd6cb472-4324-4439-9a1b-417d6f812002'

    container.register('static-value', value, null, {
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

  it('should treat objects as static copies of the original, not references', function(done) {
    done()
  })
})
