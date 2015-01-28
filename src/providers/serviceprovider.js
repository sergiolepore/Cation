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
    return new Promise((resolve, reject) => {
      // resolve arguments
      let serviceDepsPromise = util.resolveDependencies(this.container, this.options.args)

      serviceDepsPromise.then(serviceDeps => {
        serviceDeps.unshift(this.resource)

        let Resource = this.resource.bind.apply(this.resource, serviceDeps)

        return resolve(new Resource())
      }).catch(
        error => reject(error)
      )
    })
  }
}

export default ServiceProvider
