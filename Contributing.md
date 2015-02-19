
# Questions

If you need help with something, you can drop a message in the [official Gitter chat room][gitter-url]. I (@sergiolepore) or another contributor will help you :)

# Issues

## Reporting a Bug

1. Update to the most recent master release if possible. I may have already fixed your bug.
2. Search for similar issues. It's possible somebody has encountered this bug already.
3. Provide a demo code, gist or very specific steps to reproduce the error. If I cannot reproduce it, I will close the ticket.
4. Just wait until I verify the error and release a patch to correct it.

## Requesting a Feature

1. Search issues for similar feature requests. It's possible somebody has already asked for this feature or provided a pull request that's awaiting to be merged.
2. Provide a clear and detailed explanation of the feature you want and why it's important to add.
3. If the feature is complex, consider writing some initial documentation for it. If I do end up accepting the feature it will need to be documented and this will also help me to understand it better.
4. Attempt a Pull Request. If you're at all able, start writing some code :)

# Code Contributions

## Start writing code

1. Fork the [main repository][cation-repo-url].
2. Create a new branch from _master_. Give it a descriptive name, like `add-this-thing`.
3. Make sure your editor supports _editorconfig.org_ config files.
4. Install `gulp` and `mocha` globally. `npm i -g gulp` and `npm i -g mocha`.
5. `cd` into Cation directory and type `npm install` in your console. Then type `gulp`. A _file watcher_ will keep running in foreground.
6. The only two places where Cation lives are `src/` and `test/`. **Do not edit anything inside `dist/`.** This directory contains the transpiled [_ES6_][es6-url] files to _ES5_, performed by [Babel][babel-url].
7. Write using ES6 syntax inside `src/`. Everytime you save a file, _Babel_ will transpile everything to ES5 code. Then, [_Mocha_][mocha-url] will run all the test units.
8. Write using ES5 syntax inside `test/`. Everytime you save a file, _Mocha_ will run all the test units.
9. Whenever you add/modify/delete anything but documentation, **make sure the tests are not failing**. If something you are writing is not covered by the existing tests, add a new test.
10. Double check the test results.
11. Commit your changes both manually made and those made by Babel. Use a descriptive message.
12. Push your changes to your fork and submit a Pull Request. Provide some explanation of why you made the changes you made.

## Code Style

Check the [CodeStyle.md][codestyle-url] document for more info.









[gitter-url]: https://gitter.im/sergiolepore/Cation
[requirebin-url]: http://requirebin.com/
[cation-repo-url]: https://github.com/sergiolepore/Cation
[es6-url]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla
[babel-url]: https://babeljs.io/
[mocha-url]: http://mochajs.org/
[codestyle-url]: https://github.com/sergiolepore/Cation/blob/master/CodeStyle.md
