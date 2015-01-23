"use strict";

exports.decoratorReducer = decoratorReducer;
function decoratorReducer(instance, decoratorFunction) {
  return decoratorFunction(instance);
}