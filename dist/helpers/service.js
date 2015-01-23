"use strict";

exports.resolveDependencies = resolveDependencies;
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
    Promise.all(resolvedArguments).then(function (serviceArgs) {
      return resolve(serviceArgs);
    })["catch"](function (error) {
      return reject(error);
    });
  });
}

/**
 * Resolves a single string argument.
 * If the argument is a Resource Reference (denoted with a prefixed `@`), this
 * function will retrieve the service from the container.
 * Otherwise, it will return the initial value of the string argument.
 *
 * @param {Cation} container      A `Cation` instance.
 * @param {String} stringArgument String argument.
 * @api private
 */
function resolveArgument(container, stringArgument) {
  var actions = {
    "@": function (value) {
      // when stringArgument starts with `@`, it's a Resource Reference.
      return container.get(value);
    },

    "default": function (value) {
      return value;
    }
  };

  var serviceIdRegex = /^([@|\\\\/(?=@)]?)(.+)$/;
  var matches = serviceIdRegex.exec(stringArgument);
  var resolverAction = matches[1];
  var resolverValue = matches[2];

  if (typeof actions[resolverAction] === "undefined") {
    return actions["default"](resolverValue);
  }

  return actions[resolverAction](resolverValue);
}