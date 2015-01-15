var expect = require('chai').expect
var Cation = require('../../index.js')

describe('Create instance:', function(){
  it('should not expose the container ID property', function(done){
    var container = new Cation({
      id: 'container_id'
    })

    expect(
      container.__containerId__
    ).to.be.equal(undefined)

    done()
  })

  it('should have access to the container ID inside the instance', function(done) {
    var container = new Cation({
      id: 'container_id'
    })

    expect(
      container.getId()
    ).to.be.equal('container_id')

    done()
  })

  it('should have a resource registered as `container`', function(done) {
    var container = new Cation()

    expect(
      container.has('container')
    ).to.be.equal(true)

    done()
  })
})
