
/**
 * Basic Provider.
 * Intended as an Abstract Class. All providers must extend from this.
 */
class BasicProvider
{
  constructor(container, id, resource, options={}) {
    if (!container || container.constructor.name !== 'Cation') {
      throw new Error('Invalid container instance')
    }

    if (typeof options.args === 'undefined') {
      options.args = []
    }

    if (typeof options.decorators === 'undefined') {
      options.decorators = []
    }

    if (typeof options.tags === 'undefined') {
      options.tags = []
    }

    this.container = container
    this.id        = id
    this.resource  = resource
    this.options   = options
  }
}

export default BasicProvider
