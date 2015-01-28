
function CustomProvider(container, id, resource, options) {
  this.container = container
  this.id        = id
  this.resource  = resource
  this.options   = options

  this.get = function() {
    return new Promise(function(resolve) {
      this.container.register(
        'customresolver-value',
        'Hi! I\'m a value stored by the custom resolver',
        { type: 'static' }
      )

      resolve(resource)
    }.bind(this))
  }
}

module.exports = CustomProvider
