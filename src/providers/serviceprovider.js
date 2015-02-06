import BasicProvider from './basicprovider'
import * as util     from '../helpers/service'

/**
 * Service Provider
 */
class ServiceProvider extends BasicProvider
{
  constructor(container, id, resource, options={}) {
    super(container, id, resource, options)
  }

  /**
   * Provides a new instance of the registered resource.
   *
   * @return {Promise}
   * @api public
   */
  get() {
    // resolve arguments
    let serviceDepsPromise = util.resolveDependencies(this.container, this.options.args)

    return serviceDepsPromise.then(serviceDeps => {
      serviceDeps.unshift(this.resource)

      let Resource = this.resource.bind.apply(this.resource, serviceDeps)

      // bubble a new Promise
      return new Resource()
    })
  }
}

export default ServiceProvider
