/*! subcontainer helper */

/**
 * Detect ids like "foo:bar"
 * subcontainerNamespace  : foo
 * subcontainerResourceId : bar
 *
 * @param {[type]} resourceId [description]
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
