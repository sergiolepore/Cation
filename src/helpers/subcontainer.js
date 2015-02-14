/*! subcontainer helper */

/**
 * Detects and extracts ids like "foo:bar"
 *
 * @param {String} resourceId Resource ID.
 * @return {Object} { subcontainerNamespace: foo, subcontainerResourceId : bar }
 * @api public
 */
export function extractNamespace(resourceId) {
  let namespaceRegex  = /([^:]*):(.*)/
  let matches         = namespaceRegex.exec(resourceId)
  let cleanResourceId
  let cleanNamespace

  if (!matches || !matches[1] || !matches[1].length) {
    cleanResourceId = resourceId
  } else {
    cleanNamespace  = matches[1]
    cleanResourceId = matches[2]
  }

  return {
    subcontainerNamespace  : cleanNamespace,
    subcontainerResourceId : cleanResourceId
  }
}
