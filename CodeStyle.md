## Indentation

Already specified in `.editorconfig`. Use TWO spaces. No tabs.

```js
promise.then(value => {
  value.hi()
  let a = 1
  //<-- two spaces  
})
```

## Newlines

Already specified in `.editorconfig`. Use UNIX-style newlines (`\n`), and a newline character as the last character of a file. Windows-style newlines (`\r\n`) are forbidden inside any repository.

## No trailing whitespace

Already specified in `.editorconfig`. Just don't leave spaces when it's supposed to be nothing.

## Commas

Always trailing.

```js
var array = [
  'string',
  'another',
  123,
  SomethingElse
]
```

## Semicolons

Never.

```js
var a = new Something()

b.then(a => {
  a.methodCall()
  a.prop = 'Hey there!'
})
```

## Single quotes

Use single quotes, unless you are writing JSON.

```js
// awesome
var something = 'yay!'

// hmm...
var hmm = "hmm..."
```

## Opening braces go on the same line

Your opening braces go on the same line as the statement. The only exception are ES6 classes, because they can't make my eyes bleed.

```js
// good
if (true) {
  console.log('yay!')
}

// not so good
if (true)
{
  console.log('.___.')
}

// but this is good!
class AwesomeClass
{ // good
  constructor (something) { // good
    this.something = something
  }
}
```

## Declare one variable per var statement

Declare one variable per var statement, it makes it easier to re-order the lines. However, ignore [Crockford][crockford-url] when it comes to declaring variables deeper inside a function, just put the declarations wherever they make sense.

```js
// nice
var keys   = ['foo', 'bar']
var values = [23, 42]
var object = {}

while (keys.length) {
  let key     = keys.pop()
  object[key] = values.pop()
}

// please, don't do this:
var keys   = ['foo', 'bar'],
    values = [23, 42],
    object = {},
    key

while (keys.length) {
  key         = keys.pop();
  object[key] = values.pop();
}
```

## Use lowerCamelCase for variables, properties and function names

Variables, properties and function names should use `lowerCamelCase`. They should also be descriptive. Single character variables and uncommon abbreviations should generally be avoided.

```js
// neat
var resourceDependency = object.doSomething()

// no, please
var resource_dependency = object.do_something()
```

## Use UpperCamelCase for class names

Class names should be capitalized using `UpperCamelCase`.

```js
// cool
class GhostProvider
{

}

// what... hell no.
class ghost_provider
{

}
```

## Use UPPERCASE and underscores for Constants

Constants should be declared with ES6 `const` keyword, using all uppercase letters. Underscores are permitted.

```js
// great!
const SPEED_OF_LIGHT = 299792458

// no!
var speedOfLight = 299792458
```

## Use the === operator

Use the triple equality operator as it will work just as expected.

```js
var a = 0

if (a !== '') {
  console.log('winning')
}

// instead of
var a = 0

if (a == '') {
  console.log('losing')
}
```

## Alignment

Not a big deal, but alignment sometimes looks pretty neat.

```js
// nice!
var first         = 'first'
var second        = 'second'
var thirdPosition = 'third'

// not so nice :(
var first = 'first'
var second = 'second'
var thirdPosition = 'third'
```

```js
// nice!
var obj = {
  first         : 'first',
  second        : 'second',
  thirdPosition : 'third'
}

// not so nice :(
var obj = {
  first: 'first',
  second: 'second',
  thirdPosition: 'third'
}
```

```js
// nice!
import BasicProvider       from 'providers/basicprovider'
import ServiceProvider     from 'providers/serviceprovider'
import FactoryProvider     from 'providers/factoryprovider'
import StaticProvider      from 'providers/staticprovider'
import * as decoratorUtils from 'helpers/decorator'

// not so nice :(
import BasicProvider from 'providers/basicprovider'
import ServiceProvider from 'providers/serviceprovider'
import FactoryProvider from 'providers/factoryprovider'
import StaticProvider from 'providers/staticprovider'
import * as decoratorUtils from 'helpers/decorator'
```

## ES6 Features

You can use whatever ES6/ES6+ feature you want. But always make sure 6to5 can translate it to ES5 or has a polyfill for that. For example, _arrow functions_ [can be translated][arrowf-url]. _Symbols_ are supported via [polyfill][symbols-url].

**Important:** By default, 6to5 comes with all the polyfills provided by the [_core.js_][core-url] project. Don't load any other polyfills unless they are extremely necessary.

## Arrow Functions

Use parenthesis if:

- The arrow function has no parameters.
- The arrow function has two+ parameters.

Omit parenthesis otherwise.

```js
promise.then(value => {
  // no parenthesis
})

something(() => {
  // parenthesis
})

somethingElse((foo, bar) => {
  // parenthesis
})
```

Omit braces if the function body has only one line that also returns a value.

```js
// use this
myArray.filter(value => value.isEven())

// instead of
myArray.filter(value => {
  return value.isEven()
})
```

## let vs var vs const

I already explained you that you should use the `const` keyword with constants. In cases where you have to define a temporal variable, please, use `let`.

```js
// good
if (true) {
  let a = 1
}

// bad
if (true) {
  var a = 1
}
```




[crockford-url]: http://javascript.crockford.com/code.html
[arrowf-url]: http://6to5.org/docs/learn-es6/#arrows
[symbols-url]: https://github.com/zloirock/core-js#ecmascript-6-symbols
[core-url]: https://github.com/zloirock/core-js
