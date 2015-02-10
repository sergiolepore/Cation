## Factories

```js
// service_c.js
class ServiceC
{
  constructor(serviceA, serviceB) {
    this.serviceA = serviceA
    this.serviceB = serviceB
  }

  doSomethingWithDependencies() {
    // this.serviceA
    // this.serviceB
  }
}

export default ServiceC
```

```js
// custom_factory.js
import ServiceC from 'service_c'

export function CustomFactory(container) {
  let depencencyAPromise = container.get('ServiceA')
  let dependencyBPromise = container.get('ServiceB')

  // we return the promise chain.
  // remember, if you return something inside a promise, you'll get a promise whose
  // resolved value is whatever you returned in the latter.
  // `promise chaining` if you want to call it by a name.
  return Promise.all([dependencyAPromise, dependencyBPromise]).then(services => {
    let [ dependencyA, dependencyB ] = services //array destructuring

    dependencyA.doSomething()
    dependencyB.property = 'Something Else'

    // return something to create another promise that will be handled by you
    // on `Cation#get` call.
    return new ServiceC(dependencyA, dependencyB)
  })
}
```

```js
// main.js
import Cation        from 'cation'
import CustomFactory from 'custom_factory'

let container = new Cation()

container.register('ServiceC', CustomFactory, {
  type: 'factory'
})

container.get('ServiceC').then(
  serviceObject => serviceObject.doSomethingWithDependencies()
)
```
