"use strict";

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
exports.resolveDependencies = resolveDependencies;
function resolveDependencies(container) {
  var resourceArguments = arguments[1] === undefined ? [] : arguments[1];
  return new Promise(function (resolve, reject) {
    if (!resourceArguments.length) {
      return resolve([]);
    }

    // an array of Resouce promises (if the argment was a Resource Reference)
    // and static values.
    var resolvedArguments = resourceArguments.map(function (stringArgument) {
      return resolveArgument(container, stringArgument);
    });

    // try to resolve all promises in the array
    Promise.all(resolvedArguments).then(resolve)["catch"](reject);
  });
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
  var actions = {
    "@": function (value) {
      // when argument starts with `@`, it's a Resource Reference.
      return container.get(value);
    },

    "default": function (value) {
      return value;
    }
  };

  // we cant extract a service id reference from anything but a string
  if (typeof argument !== "string") {
    return argument;
  }

  // "something" -> [ 'something', '', 'something', index: 0, input: 'something' ]
  // "@ServiceID" -> [ '@ServiceID', '@', 'ServiceID', index: 0, input: '@ServiceID' ]
  // "\\@SomethingNotID" -> [ '\\@SomethingNotID', '\\', '@SomethingNotID', index: 0, input: '\\@SomethingNotID' ]
  // "Not a @ServiceID" -> [ 'Not a @ServiceID', '', 'Not a @ServiceID', index: 0, input: 'Not a @ServiceID' ]
  var serviceIdRegex = /^([@|\\\\/(?=@)]?)(.+)$/;
  var matches = serviceIdRegex.exec(argument);
  var resolverAction = matches[1]; // get the reference char "@" or the escape char "\\"
  var resolverValue = matches[2]; // get the clean argument (without "@" or "\\")

  if (typeof actions[resolverAction] === "undefined") {
    return actions["default"](resolverValue);
  }

  return actions[resolverAction](resolverValue);
}
Object.defineProperty(exports, "__esModule", {
  value: true
});