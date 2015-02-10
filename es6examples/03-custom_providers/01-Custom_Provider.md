## Custom Providers

```js
// ghost_provider.js
import { BasicProvider } from 'cation'

/**
 * The GhostProvider will register a new static resource every time you
 * register something using this type.
 * Also, it provides a "Boo! 👻" string when trying to retrieve the registered resource.
 */
class GhostProvider extends BasicProvider
{
  /*
   * Constructor
   *
   * @param {Cation} container A Cation instance
   * @param {String} id        The Resource ID
   * @param {mixed}  resource  The Resource Object
   * @param {Object} options   The register options
   */
  constructor(container, id, resource, options) {
    super(container, id, resource, options)

    let date = new Date().toDateString()

    this.container.register(
      `${id}-gravestone`,
      `Here lies ${id}. ${date} - ${date}. RIP`,
      { type: 'static' }
    )
  }

  // This is where magic happens...
  // You must ALWAYS implement a `get` method.
  get() {
    // And this method should ALWAYS return a new Promise.
    // NEVER forget to resolve the promise with whatever you want to return on `Cation#get`. Never.
    return new Promise(
      resolve => resolve('Boo! 👻')
    )
  }
}

export default GhostProvider
```

```js
// main.js
import Cation        from 'cation'
import GhostProvider from 'ghost_provider'

let container = new Cation()

container.addProvider('ghost', GhostProvider)

container.register('DeadResource', 'resource value', {
  type: 'ghost'
})

// and here... we... GO.

container.get('DeadResource').then(resource => {
  console.log(resource) // Boo! 👻

  return container.get('DeadResource-gravestone')
}).then(
  gravestone => console.log(gravestone)
  // Here lies DeadResource. Wed Jan 28 2015 - Wed Jan 28 2015. RIP
)
```
