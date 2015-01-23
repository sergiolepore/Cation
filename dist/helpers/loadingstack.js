"use strict";

exports.init = init;
exports.push = push;
exports.has = has;
exports.remove = remove;
/*! Loading stack helper */

/**
* Loading Stack.
* An array containing the IDs of the resources being currently loaded.
* Useful to track circular references.
*
* @type {Array}
* @api private
*/
var __loadingStack__ = Symbol();

/**
 * Initializes a stack inside a container, by registering a property
 * that can not be accessible from the outside.
 * This prevents accidental modification of the stack.
 *
 * @param  {Cation} container A `Cation` instance.
 * @api public
 */
function init(container) {
  container[__loadingStack__] = [];
}

/**
 * Pushes a resource ID into the stack.
 *
 * @param  {Cation} container A `Cation` instance.
 * @param  {String} id        A resource ID.
 * @api public
 */
function push(container, id) {
  var stack = container[__loadingStack__];

  stack.push(id);
}

/**
 * Checks if a resource ID exists inside a stack.
 *
 * @param  {Cation}  container A `Cation` instance.
 * @param  {String}  id        A resource ID.
 * @return {Boolean}
 * @api public
 */
function has(container, id) {
  var stack = container[__loadingStack__];

  return stack.includes(id);
}

/**
 * Removes a resoure ID from the stack.
 *
 * @param  {Cation} container A `Cation` instance.
 * @param  {[type]} id        A resource ID.
 * @api public
 */
function remove(container, id) {
  if (!has(container, id)) {
    return;
  }

  var stack = container[__loadingStack__];

  stack.splice(stack.indexOf(id), 1);
}