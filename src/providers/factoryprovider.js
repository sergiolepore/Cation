import BasicProvider from './basicprovider'

/**
 * Factory Provider
 */
class FactoryProvider extends BasicProvider
{
  constructor(container, resource, options={}) {
    super(container, resource, options)
  }

  /**
   * Provides the result of the resource execution.
   *
   * @return {Promise}
   * @api public
   */
  get() {
    return new Promise(resolve => {
      return resolve(this.resource.apply(this.resource, [this.container]))
    })
  }
}

export default FactoryProvider
