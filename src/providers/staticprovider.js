import BasicProvider from './basicprovider'

/**
 * Static Provider
 */
class StaticProvider extends BasicProvider
{
  constructor(container, resource, options={}) {
    super(container, resource, options)
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
