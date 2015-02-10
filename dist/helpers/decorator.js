"use strict";

/*! Decorator Helper */

/**
 * Decorator reducer function.
 * Used to iterate over an array of decorators and providing each one of them
 * the resource instance.
 *
 *    decoratorArr.reduce(reducer, resourceInstance)
 *
 * @param  {Object}  instance          Resource instance.
 * @param  {Functin} decoratorFunction Decorator.
 * @return {Object}                    The resource instance just decorated.
 */
exports.reducer = reducer;
function reducer(instance, decoratorFunction) {
  // each decorator must return the decorated instance.
  // this way it feeds the next decorator in the chain.
  return decoratorFunction(instance);
}
Object.defineProperty(exports, "__esModule", {
  value: true
});