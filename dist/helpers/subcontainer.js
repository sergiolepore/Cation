"use strict";

/*! subcontainer helper */

/**
 * [extractNamespace description]
 * @param {[type]} resourceId [description]
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