
function CustomProvider(container, resource, options) {
  this.container = container
  this.resource = resource
  this.options = options

  this.get = function() {
    return new Promise(function(resolve) {
      this.container.register(
        'customresolver-value',
        'Hi! I\'m a value stored by the custom resolver',
        { type: 'static' }
      ).then(function() {
        resolve(resource)
      })
    }.bind(this))
  }
}

module.exports = CustomProvider
