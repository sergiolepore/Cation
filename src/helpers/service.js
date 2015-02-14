/*! Service helper */

/**
 * Resolves all the possible Resource References configured as a Resource arguments.
 *
 *   ['static-value', 1234, '@ThisIsAResourceReference', '@OtherResourceInsideTheContainer']
 *
 * @param {Cation} container            A `Cation` instance.
 * @param {Array}  resourceArguments=[] An array of Resource arguments
 * @api public
 */
export function resolveDependencies(container, resourceArguments=[]) {
  return new Promise((resolve, reject) => {
    if (!resourceArguments.length) {
      return resolve([])
    }

    // an array of Resouce promises (if the argment was a Resource Reference)
    // and static values.
    let resolvedArguments = resourceArguments.map(
      stringArgument => resolveArgument(container, stringArgument)
    )

    // try to resolve all promises in the array
    Promise
      .all(resolvedArguments)
      .then(resolve)
      .catch(reject)
  })
}

/**
 * Resolves a single string argument.
 * If the argument is a Resource Reference (denoted with a prefixed `@`), this
 * function will retrieve the service from the container.
 * Otherwise, it will return the initial value of the string argument.
 *
 * @param {Cation} container  A `Cation` instance.
 * @param {String} argument   String argument.
 * @api private
 */
function resolveArgument(container, argument) {
  let actions = {
    '@': function(value) {
      // when argument starts with `@`, it's a Resource Reference.
      return container.get(value)
    },

    'default': function(value) {
      return value
    }
  }

  // we cant extract a service id reference from anything but a string
  if (typeof argument !== 'string') {
    return argument
  }

  // "something" -> [ 'something', '', 'something', index: 0, input: 'something' ]
  // "@ServiceID" -> [ '@ServiceID', '@', 'ServiceID', index: 0, input: '@ServiceID' ]
  // "\\@SomethingNotID" -> [ '\\@SomethingNotID', '\\', '@SomethingNotID', index: 0, input: '\\@SomethingNotID' ]
  // "Not a @ServiceID" -> [ 'Not a @ServiceID', '', 'Not a @ServiceID', index: 0, input: 'Not a @ServiceID' ]
  let serviceIdRegex = /^([@|\\\\/(?=@)]?)(.+)$/
  let matches        = serviceIdRegex.exec(argument)
  let resolverAction = matches[1] // get the reference char "@" or the escape char "\\"
  let resolverValue  = matches[2] // get the clean argument (without "@" or "\\")

  if (typeof actions[resolverAction] === 'undefined') {
    return actions['default'](resolverValue)
  }

  return actions[resolverAction](resolverValue)
}
