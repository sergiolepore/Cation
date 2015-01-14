describe('Cation Tests:', function(){
  before(require('./scripts/before.js'))

  require('./scripts/basic.js')
  require('./scripts/register.js')
  require('./scripts/get.js')

  after(require('./scripts/after.js'))
})
