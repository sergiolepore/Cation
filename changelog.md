
# 2.0.1 (January 29, 2015)

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
