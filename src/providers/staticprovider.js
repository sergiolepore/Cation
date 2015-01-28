import BasicProvider from './basicprovider'

/**
 * Static Provider
 */
class StaticProvider extends BasicProvider
{
  constructor(container, id, resource, options={}) {
    super(container, id, resource, options)
  }

  /**
   * Provides the registered resource without any manipulation.
   *
   * @return {Promise}
   * @api public
   */
  get() {
    return new Promise(resolve => {
      return resolve(this.resource)
    })
  }
}

export default StaticProvider
