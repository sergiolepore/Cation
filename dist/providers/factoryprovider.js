'use strict';

var _interopRequireDefault = function (obj) { return obj && obj.__esModule ? obj : { 'default': obj }; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _BasicProvider2 = require('./basicprovider');

var _BasicProvider3 = _interopRequireDefault(_BasicProvider2);

/**
 * Factory Provider
 */

var FactoryProvider = (function (_BasicProvider) {
  function FactoryProvider(container, id, resource) {
    var options = arguments[3] === undefined ? {} : arguments[3];

    _classCallCheck(this, FactoryProvider);

    _get(Object.getPrototypeOf(FactoryProvider.prototype), 'constructor', this).call(this, container, id, resource, options);
  }

  _inherits(FactoryProvider, _BasicProvider);

  _createClass(FactoryProvider, [{
    key: 'get',

    /**
     * Provides the result of the resource execution.
     *
     * @return {Promise}
     * @api public
     */
    value: function get() {
      return this.resource.apply(this.resource, [this.container]) // execute the factory function. it must return a promise.
      ;
    }
  }]);

  return FactoryProvider;
})(_BasicProvider3['default']);

exports['default'] = FactoryProvider;
module.exports = exports['default'];