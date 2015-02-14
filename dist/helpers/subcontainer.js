"use strict";

/*! subcontainer helper */

/**
 * Detects and extracts ids like "foo:bar"
 *
 * @param {String} resourceId Resource ID.
 * @return {Object} { subcontainerNamespace: foo, subcontainerResourceId : bar }
 * @api public
 */
exports.extractNamespace = extractNamespace;
function extractNamespace(resourceId) {
  var namespaceRegex = /([^:]*):(.*)/;
  var matches = namespaceRegex.exec(resourceId);
  var cleanResourceId = undefined;
  var cleanNamespace = undefined;

  if (!matches || !matches[1] || !matches[1].length) {
    cleanResourceId = resourceId;
  } else {
    cleanNamespace = matches[1];
    cleanResourceId = matches[2];
  }

  return {
    subcontainerNamespace: cleanNamespace,
    subcontainerResourceId: cleanResourceId
  };
}
Object.defineProperty(exports, "__esModule", {
  value: true
});