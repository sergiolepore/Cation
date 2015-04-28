'use strict';

var _interopRequireWildcard = function (obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (typeof obj === 'object' && obj !== null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } };

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

var _import = require('../helpers/service');

var util = _interopRequireWildcard(_import);

/**
 * Service Provider
 */

var ServiceProvider = (function (_BasicProvider) {
  function ServiceProvider(container, id, resource) {
    var options = arguments[3] === undefined ? {} : arguments[3];

    _classCallCheck(this, ServiceProvider);

    _get(Object.getPrototypeOf(ServiceProvider.prototype), 'constructor', this).call(this, container, id, resource, options);
  }

  _inherits(ServiceProvider, _BasicProvider);

  _createClass(ServiceProvider, [{
    key: 'get',

    /**
     * Provides a new instance of the registered resource.
     *
     * @return {Promise}
     * @api public
     */
    value: function get() {
      var _this = this;

      // resolve arguments
      var serviceDepsPromise = util.resolveDependencies(this.container, this.options.args);

      return serviceDepsPromise.then(function (serviceDeps) {
        serviceDeps.unshift(_this.resource);

        var Resource = _this.resource.bind.apply(_this.resource, serviceDeps);

        // bubble a new Promise
        return new Resource();
      });
    }
  }]);

  return ServiceProvider;
})(_BasicProvider3['default']);

exports['default'] = ServiceProvider;
module.exports = exports['default'];