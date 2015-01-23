
exports.decoratorA = function(instance) {
  instance.propertyA = 'Hi! I\'m a new property from decoratorA'

  return instance
}

exports.decoratorB = function(instance) {
  instance.propertyB = 'Hi! I\'m a new property from decoratorB'

  return instance
}
