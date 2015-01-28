## Cation

A fast and customizable `Dependency Injection Container` for [node](http://nodejs.org).

[![NPM Version][npm-image]][npm-url]
[![NPM Downloads][downloads-image]][downloads-url]
[![Build Status][travis-image]][travis-url]
[![Donations][gratipay-image]][gratipay-url]
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/sergiolepore/Cation?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

```js
var container = new Cation()
var Atom      = function() { /* Atom service! */ }

container.register('Atom', Atom)

container.get('Atom').then(function(atom) {
  /* new atom object! */
})
```

## Brief intro

Cation is a powerful Dependency Injection Container (DIC). The first version was released on 2011-2012 as an unstable/experimental library and was inspired by the Symfony 2 container. [It only allowed a JSON schema to register a service (yeah, it was an ugly experiment)](https://github.com/sergiolepore/Cation/blob/f57243df6678da06d483c55ece5e2a67e501ae97/README.md#usage). There was no Factories, no Decorators. Just "Services".

**The version 2 is a MUCH, MUCH BETTER EVOLUTION**, heavily inspired on these projects:

-  [Symfony DIC](http://symfony.com/doc/current/components/dependency_injection/introduction.html) - [API](http://api.symfony.com/2.7/Symfony/Component/DependencyInjection/ContainerBuilder.html)
- [Dependency Injection: the Ember.js way](http://emberjs.com/guides/understanding-ember/dependency-injection-and-service-lookup/) - [API](http://emberjs.com/api/classes/Ember.Application.html)
- [Dependency Injection: the Angular.js way](https://docs.angularjs.org/guide/di) - [API](https://docs.angularjs.org/api/ng/type/angular.Module)

Cool things you'll enjoy for sure:

- Organize all your dependencies in a single place. Retrieve them only when you need them.
- `Service`, `Factory` and `Static` _resource providers_, right out of the box.
- User-defined / Custom _resource providers_.
- `Decorator` support.
- Lazy loaded dependencies (and it's awesome).
- Future-proof JavaScript / ES6 support.
- Beautiful API.

## Installation

```bash
$ npm install cation
```

## Usage

### Services

#### Simple Services

This is probably one of those things you are doing a lot, creating new objects. I'm going to reuse the `Atom` example from the top of this file and explain with simple words what happens when you use **Cation**.

This is the constructor for a service object:

```js
var Atom = function() { /* Atom constructor */ }
```

And this is how you register the Atom constructor in the container:

```js
var container = new Cation()

container.register('Atom', Atom)
```

Boom. It's done. If you need a new object:

```js
container.get('Atom').then(function(atom) {
    // a new Atom instance over here!
})

// or...

var getAtomPromise = container.get('Atom')

getAtomPromise.then(function(atom) {
    // a new Atom instance over here!
})
```

So, what happened here?

- You call `Cation#register`.
- Cation creates a new `ServiceProvider` object with the arguments you provided.
- Cation stores the provider object in an internal _repository_.
- Done with the register process.
- Now you call `Cation#get`.
- Cation returns a new `Promise` object.
- You call `Promise#then` and pass a callback function that will be executed when the promise is resolved.
- In the meantime, Cation looks in the repository for the desired provider.
- Cation asks the provider to digest the original arguments and to return _something_.
- The `ServiceProvider` internally creates a new object from the constructor function you provided in the first place and returns it.
- Cation  _resolves_ the previous promise with the object returned by the provider.
- You have your service object.


#### Dependency Injection

The main purpose of a Dependency Injection Container. Imagine you need to create a _chemical element_ object, with a few arguments:

```js
var Element = function(name, symbol, atomicNumber, atomicWeight) {
  this.name         = name
  this.symbol       = symbol
  this.atomicNumber = atomicNumber
  this.atomicWeight = atomicWeight
}

container.register('Hydrogen', Element, {
  args: ['Hydrogen', 'H', 1, 1.008]
})

container.get('Hydrogen').then(function(element) {
  console.log(element.name) // Hydrogen
})
```

What if one or more arguments are **dependencies to other services**? Let's take a look at a little more complex example:

```js
// HEADS UP!
//
// For the sake of "simplicity", I'm going to use a few ES6 features in this example.
//
// The third argument here, ...elements, is known as a "rest parameter" and is part of the ES6 specification.
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters
var Compound = function(name, formula, ...elements) {
  this.name     = name
  this.formula  = formula
  this.elements = elements

  this.getMolarMass = function() {
    // HEADS UP!
    // I'm using "arrow functions" here. It's also part of ES6.
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions
    return this.elements
      .map(element => element.atomicWeight)
      .reduce((accumulator, weight) => accumulator + weight)
  }
}

container.register('Hydrogen', Element, {
  args: ['Hydrogen', 'H', 1, 1.008]
})

container.register('Oxygen', Element, {
  args: ['Oxygen', 'O', 8, 15.999]
})

// This. Read it carefully...
container.register('Water', Compound, {
  args: ['Water', 'H2O', '@Hydrogen', '@Oxygen', '@Hydrogen'] // notice the "@"?
})

container.get('Water').then(function(molecule) {
  console.log(molecule.formula) // H2O
  console.log(molecule.getMolarMass()) // 18.015
})
```

Sweet, isn't it? Just remember: you can use whatever you want as an argument. But if you need an argument that is a registered resource in Cation, you need to reference it by using a string like "@MyRegisteredResource".

**Q**: What if I need, in fact, an argument that is a string and starts with the `@` character **but it's not a resource reference**?

**A:** You can escape it with _double backslashes_.

```js
container.register('Something', Something, {
  args: ['@ServiceReference', '\\@NormalStringArgument']
})
```

By doing this, your service will receive a new _ServiceReference_ object as a first argument and "@NormalStringArgument" as a second argument.

#### Singletons

Enabling this pattern is as easy as setting an option named `singleton` to `true`.

```js
container.register('SingletonService', Service, {
  singleton: true
})
```

#### A note about Service `register` options

As you can see, the `register` method can take up to three arguments:

- id: resource identifier.
- resource: the resource to be registered (in this case, the service constructor).
- options: an object containing options.

When you are registering a `service`, the available options are:

- `type`: this option is always provided by default as `service`. You can replace it with `type: 'factory'` and you'll be registering a factory, instead of a service. You'll learn about this in the next topic.
- `singleton`: boolean option and `false` by default. If set to true, Cation will treat the resource as a singleton.
- `args`: array option, `[]` by default. These are the arguments to apply to the service constructor. It only works if the `type` is `service`.
- `decorators`: array option, `[]` by default. These are the names of the `Decorators` to be applied to the returned objects. You'll learn about this in the `Decorators` topic.

Knowing that, these options are the same:

```js
{
  type       : 'service',
  singleton  : true,
  args       : ['a', 2, '@B'],
  decorators : ['decorator1', 'decorator2']
}

{
  singleton  : true,
  args       : ['a', 2, '@B'],
  decorators : ['decorator1', 'decorator2']
}
```

```js
{
  args      : []
  singleton : true
}

{
  singleton: true
}
```

### Factories

If you need a more granular control over your created objects, you can opt for the _Factory Pattern_. In Cation, a factory must follow these simple rules:

- The factory function receives the container object as an optional argument. Useful only if you need dependencies from it.
- The factory function **must** return a _Promise_.
- The `Cation#register` method must receive an `options` object with, at least, a property `type` equals to `factory`.

```js
// if you know how promises work, you'll notice that this code block can be
// simpliflied by just returning the execution of Promise.all().then().
// I'll keep this example to explicitly show the returned promise.
container.register('ServiceC', function(container) {
  var factoryPromise = new Promise(function(resolveFactoryPromise, rejectFactoryPromise) {
    var depencencyAPromise = container.get('ServiceA')
    var dependencyBPromise = container.get('ServiceB')

    // main promise will resolve when all dependency promises are resolved
    Promise.all([dependencyAPromise, dependencyBPromise]).then(function(services) {
      // our resolved services
      var dependencyA = service[0]
      var dependencyB = service[1]

      dependencyA.doSomething()
      dependencyB.property = 'Something Else'

      resolveFactoryPromise(new ServiceC(dependencyA, dependencyB))
    }).catch(function(error) {
      rejectFactoryPromise(error)
    })
  })

  return factoryPromise
}, {
  type: 'factory'
})

container.get('ServiceC').then(function(serviceObject) {
  // do something with serviceObject
})
```

```js
// and this is the simplified version of the above implementation
container.register('ServiceC', function(container) {
  var depencencyAPromise = container.get('ServiceA')
  var dependencyBPromise = container.get('ServiceB')

  // we return the promise chain.
  // remember, if you return something inside a promise, you'll get a promise whose
  // resolved value is whatever you returned in the latter.
  // `promise chaining` if you want to call it by a name.
  return Promise.all([dependencyAPromise, dependencyBPromise]).then(function(services) {
    // our resolved services
    var dependencyA = services[0]
    var dependencyB = services[1]

    dependencyA.doSomething()
    dependencyB.property = 'Something Else'

    // return something to create another promise that will be handled by you
    // on `Cation#get` call.
    return new ServiceC(dependencyA, dependencyB)
  })
})

container.get('ServiceC').then(function(serviceObject) {
  // still works!
})
```

#### Options

The `Cation#register` method, when registering a factory resource, can take these options:

- `type`: you **MUST** set this option to `'factory'`.
- `singleton`: boolean option, `false` by default. After the first factory execution, the instance will be stored as a singleton.
- `decorators`: array option, `[]` by default. These are the names of the `Decorators` to be applied to the returned objects. You'll learn about this in the `Decorators` topic.

### Static resources

These kind of resources are treated as _constants_ by Cation. You can freely register a number, string, array, object or functions. Every time you call `Cation#get` you'll receive the same value.

```js
// register a static resource
container.register('hydrogen-atomic-weight', 1.008, {
  type: 'static'
})

// use the resource as a dependency in a service
container.register('Hydrogen', Element, {
  args: ['Hydrogen', 'H', 1, '@hydrogen-atomic-weight']
})
```

#### Options

- `type`: you **MUST** set this option to `'static'`.

### Decorators

The Cation decorators are simple functions called just after the service creation, but before it's returned to you. Its main purpose is to _decorate_ a given object.
Every decorator must follow these rules:

- The decorator function must receive the object to decorate, as an argument.
- The decorator function must return the same object or another one that supersedes it.
- The `Cation#register` method must receive an `options` object with, at least, a property `decorators` equals to an array with the decorator names to be applied.

```js
// Example inspired by "Learning JavaScript Design Patterns" book by Addy Osmani

function BasicMacBookProRetina() {
  this.resolution = function() { return 13 }
  this.storage    = function() { return 128 }
  this.cpu        = function() { return '2.6GHz dual-core Intel Core i5' }
  this.price      = function() { return 1299 }
  this.toString   = function() {
    return '%in%-inch MacBook Pro with Retina Display. Storage: %storage%GB. CPU: %cpu%. Price: $%price%.'
      .replace(/%in%/, this.resolution())
      .replace(/%storage%/, this.storage())
      .replace(/%cpu%/, this.cpu())
      .replace(/%price%/, this.price())
  }
}

container.addDecorator('storage', function(macbook) {
  var originalStorage = macbook.storage()
  var originalCost    = macbook.cost()

  macbook.storage = function() { return originalStorage * 2 }
  macbook.cost    = function() { return cost + 200 }

  return macbook
})

container.addDecorator('cpu', function(macbook) {
  var originalCost = macbook.cost()

  macbook.cost = function() { return originalCost + 100 }
  macbook.cpu  = function() { return '2.8GHz dual-core Intel Core i5' }

  return macbook
})

// 128GB storage version
container.register('13in-MBP-Retina-128', BasicMacBookProRetina)

// 256GB storage version
container.register('13in-MBP-Retina-256', BasicMacBookProRetina, {
  decorators: ['storage']
})

// 512GB storage + higher freq CPU
container.register('13in-MBP-Retina-512', BasicMacBookProRetina, {
  decorators: ['storage', 'storage', 'cpu']
})

// ----

container.get('13in-MBP-Retina-128').then(function(macbook) {
  console.log(macbook)
  // 13-inch MacBook Pro with Retina Display. Storage: 128GB. CPU: 2.6GHz dual-core Intel Core i5. Price: $1299.
})

container.get('13in-MBP-Retina-256').then(function(macbook) {
  console.log(macbook)
  // 13-inch MacBook Pro with Retina Display. Storage: 256GB. CPU: 2.6GHz dual-core Intel Core i5. Price: $1499.
})

container.get('13in-MBP-Retina-512').then(function(macbook) {
  console.log(macbook)
  // 13-inch MacBook Pro with Retina Display. Storage: 512GB. CPU: 2.8GHz dual-core Intel Core i5. Price: $1799.
})
```

### Custom Resource Providers

Every time you call `Cation#register` and, in the options object, you specify a `type`, what you are really doing is telling Cation to use an specific `Resource Provider`.
As you can clearly see now, Cation comes with three Providers by default:

- `ServiceProvider`. { type: 'service' }
- `FactoryProvider`. { type: 'factory' }
- `StaticProvider`. { type: 'static' }

What if, for some reason, you need a custom provider?

```js
/**
 * The GhostProvider will register a new static resource every time you
 * register something using this type.
 * Also, it provides a "Boo! 👻" string when trying to retrieve the registered resource.
 *
 * @param {Cation} container A Cation instance
 * @param {String} id        The Resource ID
 * @param {mixed}  resource  The Resource Object
 * @param {Object} options   The register options
 */
function GhostProvider(container, id, resource, options) {
  // All ResourceProviders are created with these args, always.
  this.container = container
  this.id        = id
  this.resource  = resource
  this.options   = options

  this.container.register(
    '%id%-gravestone'.replace(/%id%/, this.id),
    'Here lies %id%. %date% - %date%. RIP'
      .replace(/%id%/, this.id)
      .replace(/%date%/, new Date().toDateString())
    ,
    { type: 'static' }
  )

  // This is where magic happens...
  // You must ALWAYS implement a `get` method.
  this.get = function() {
    // And this method should ALWAYS return a new Promise.
    return new Promise(function(resolve) {
      // NEVER forget to resolve the promise with whatever you want to return on `Cation#get`. Never.
      resolve('Boo! 👻')
    })
  }
}

container.addProvider('ghost', GhostProvider)

container.register('DeadResource', 'resource value', {
  type: 'ghost'
})

// and here... we... GO.

container.get('DeadResource').then(function(resource) {
  console.log(resource) // Boo! 👻

  return container.get('DeadResource-gravestone')
}).then(function(gravestone) {
  console.log(gravestone) // Here lies DeadResource. Wed Jan 28 2015 - Wed Jan 28 2015. RIP
})
```

[npm-image]: https://img.shields.io/npm/v/cation.svg?style=flat
[npm-url]: https://npmjs.org/package/cation
[downloads-image]: https://img.shields.io/npm/dm/cation.svg?style=flat
[downloads-url]: https://npmjs.org/package/cation
[travis-image]: https://img.shields.io/travis/sergiolepore/Cation.svg?style=flat
[travis-url]: https://travis-ci.org/sergiolepore/cation
[gratipay-image]: https://img.shields.io/gratipay/sergiolepore.svg?style=flat
[gratipay-url]: https://gratipay.com/sergiolepore/
