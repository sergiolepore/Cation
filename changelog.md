
## 2.3.0 (April 27, 2015)

  * [Enhancement] replace 6to5 with babel
  * [Documentation] fix typo in ES6 Examples

## 2.2.1 (February 10, 2015)

  * [Bugfix] Singleton behaviour wasn't working at all. Fixes #10
  * [Refactor] ES6 syntactic sugar

## 2.2.0 (February 09, 2015)

  * [Enhancement] upgrade 6to5 to v3
  * [Feature] expose BasicProvider class. See ES6 examples directory.
  * [Documentation] added `EcmaScript 6` examples.

## 2.1.3 (February 05, 2015)

  * Updated documentation
  * ES6 code improvements (internal)

## 2.1.2 (February 02, 2015)

Little improvement in documentation.

## 2.1.1 (February 01, 2015)

Added missing documentation for 'tags' feature. Fixed a few typos in README.

## 2.1.0 (February 01, 2015)

  * Added a new feature to tag resources. See [this](https://github.com/sergiolepore/Cation/blob/master/README.md#working-with-tagged-resources).
  * Improved the internal container storage

## 2.0.3 (February 01, 2015)

Removed useless dependencies and improved the build process.

## 2.0.2 (January 31, 2015)

  * Fixed an error in documentation
  * Removed and old and useless file

## 2.0.1 (January 29, 2015)

  * Fixed a few typos

## 2.0.0 (January 28, 2015)

Super awesome new version! I can't really list all changes since 1.0.0-alpha.2, so you should check the README.md file for yourself :)

## 1.0.0-Alpha.2 (Nov 09, 2012)

Features:

  - Support for JSON parameters. Ie: %a.b.c% -> {a: {b: {c: 'value'} } }
  - Added "build" option. This allows to specify a different builder method. Ie: {..., "build": { "listen": ["@express.app"] } }
  - Added "build_as" for "calls". This allows to put the execution of the called method as another service inside the container.

Documentation:

  - Added doc index, chapters and how-to's.

## 1.0.0-Alpha (Oct 17, 2012)

Features:

  - Full dependency injection container.
  - Service schemas can be set via constructor or setters, in JSON format.
  - Support for common parameters, shared between all services hosted on the container.
  - Service definitions can be references loaded inside the container.
  - Triggers to execute service methods, useful for setter injection or quick configuration.
  - And again, all of this features can be handled on a simple json schema.

Documentation:

  - Added docs and refereces for dependency injection. (pending)

ToDos:

  - See "todo.md"

## 0.2.1 (Oct 08, 2012)

Features:

  - Method for adding modules

## 0.2.0 (Sep 27, 2012)

Features:

  - Added support for parameters on module paths
