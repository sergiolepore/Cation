"use strict";

/**
 * Basic Provider.
 * Intended as an Abstract Class. All providers must extend from this.
 */
var BasicProvider = function BasicProvider(container, id, resource) {
  var options = arguments[3] === undefined ? {} : arguments[3];
  if (!container || container.constructor.name !== "Cation") {
    throw new Error("Invalid container instance");
  }

  if (typeof options.args === "undefined") {
    options.args = [];
  }

  if (typeof options.decorators === "undefined") {
    options.decorators = [];
  }

  this.container = container;
  this.id = id;
  this.resource = resource;
  this.options = options;
};

module.exports = BasicProvider;