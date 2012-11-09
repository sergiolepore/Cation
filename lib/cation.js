var param_replacer = require('param_replacer');

var cation = module.exports = function(parameters, services) {
  var parameter_bag = parameters || {},
      service_bag = services || {},
      is_loading = [];

  service_bag.param_replacer = {
    'require': param_replacer
  };
  
  /**
   * Adds new parameter/s to Service Container.
   *
   * @param {json} parameters Parameters in JSON format: {'name':'value'}
   * @return {cation}
   */
  cation.addParameters = function(parameters) {
    // merge json objects
    for (var parameter_name in parameters) {
      parameter_bag[parameter_name] = parameters[parameter_name];
    }

    return cation;
  };

  /**
   * Adds new service definition/s to Service Container.
   *
   * @param {json} definition Definition in JSON format: { 'alias': { 'require': 'mod', 'args': ['a'] } }
   * @return {cation}
   */
  cation.addServiceDefinition = function(definition) {
    // merge json objects
    for (var service_alias in definition) {
      service_bag[service_alias] = definition[service_alias];
    }

    return cation;
  };

  /**
   * Gets all loaded parameters.
   * @return {json}
   */
  cation.getParameters = function() {
    return parameter_bag;
  };

  /**
   * Gets all loaded services.
   *
   * @return {json}
   */
  cation.getServiceBag = function() {
    return service_bag;
  };

  /**
   * Checks if the given service is defined on the container.
   *
   * @param  {string}  service_alias Service alias (defined in service definition)
   * @return {Boolean}
   */
  cation.has = function(service_alias) {
    return service_bag.hasOwnProperty(service_alias);
  };

  /**
   * Checks if the given service is loaded in memory.
   *
   * @param  {string}  service_alias
   * @return {Boolean}
   */
  cation.hasLoaded = function(service_alias) {
    var ret = false;

    if (cation.has(service_alias)) {
      ret = (typeof service_bag[service_alias].require !== 'string');
    }

    return ret;
  };

  /**
   * Gets a service.
   * This method constructs an object based on the service definition.
   *
   * @param  {string} service_alias Service alias (defined in service definition)
   * @return {object}
   */
  cation.get = function(service_alias) {
    if (!cation.has(service_alias)) {
      return false;
    }

    return service_bag[service_alias].require;
  };

  /**
   * Removes a service from the container.
   * TO BE IMPLEMENTED.
   *
   * @todo Remove "service_alias" from service_definitions and service_bag
   * @param  {string} service_alias Service alias (defined in service definition)
   * @return {cation}
   */
  cation.remove = function(service_alias) {
    return cation;
  };

  /**
   * Creates a new service object and stores it in memory.
   *
   * @param {string} service_alias
   * @param {function} onSuccess
   * @param {function} onFailure
   * @return {[type]} [description]
   */
  var loadService = function(service_alias, onSuccess, onFailure) {
    if (is_loading.indexOf(service_alias) !== -1) {
      onFailure(service_alias, 'Circular reference detected.');
    }

    is_loading.push(service_alias);

    var this_definition = service_bag[service_alias],
        srv_require = getDefinitionParameter(this_definition, 'require', false),
        srv_builder = getDefinitionParameter(this_definition, 'build', []),
        srv_args    = getDefinitionParameter(this_definition, 'args', []),
        srv_calls   = getDefinitionParameter(this_definition, 'calls', {}),
        srv_module  = null;

    if (!srv_require) {
      onFailure(service_alias, '"require" parameter must be setted.');
    }

    if (!cation.hasLoaded(service_alias)) { //prevent loading already loaded service
      srv_require = replaceParameters(srv_require); //parameters %param% will be replaced by their values
      srv_module = require(srv_require); //require module

      for (var i=0;i<srv_args.length;i++) {
        //for arguments to be injected via constructor, replace %param% and @servicereference
        srv_args[i] = replaceParameters(srv_args[i]);
        srv_args[i] = replaceServiceReferences(service_alias, srv_args[i], onSuccess, onFailure);
      }

      //construct a new service and store it
      if (srv_builder instanceof Array) { // ensure that wants to build the require
        if (srv_builder) { // if it's defined
          var builder_method = srv_builder[0],
              builder_args = srv_builder[1];

          if (typeof builder_args !== 'undefined') {
            for (i=0; i<builder_args.length; i++) {
              builder_args[i] = replaceParameters(builder_args[i]);
              builder_args[i] = replaceServiceReferences(service_alias, builder_args[i], onSuccess, onFailure);
            }
          } else {
            builder_args = [];
          }

          service_bag[service_alias].require = dispatchObject(srv_module[builder_method], builder_args);
        } else {
          service_bag[service_alias].require = dispatchObject(srv_module, srv_args);
        }
      } else { // builder is false, no need to build object
        service_bag[service_alias].require = srv_module;
      }

      for (var method_name in srv_calls) {
        //setter injection and method call (post service creation)
        var method_args = srv_calls[method_name];

        service_bag[service_alias].require[method_name].apply(service_bag[service_alias].require, method_args);
      }
    }

    // finished loading. Remove the circular reference control
    is_loading.splice(is_loading.indexOf(service_alias), 1);

    onSuccess(service_alias);
  };

  /**
   * Extracts a given parameter value contained on service definition.
   *
   * @param  {json} definition
   * @param  {string} param_name
   * @param  {} default_value
   * @return {}
   */
  var getDefinitionParameter = function(definition, param_name, default_value) {
    if (!definition.hasOwnProperty(param_name)) {
      return default_value;
    }

    return definition[param_name];
  };

  /**
   * Replaces all occurences of %param% with the value previously setted on the container.
   *
   * @param  {string} target
   * @return {string}
   */
  var replaceParameters = function(target) {
    return param_replacer.replace(target, parameter_bag);
  };

  /**
   * Replaces all occurences of @something with the specified service instance.
   *
   * @param  {string} parent_alias
   * @param  {string} target
   * @param {function} onSuccess
   * @param {function} onFailure
   * @return {}
   */
  var replaceServiceReferences = function(parent_alias, target, onSuccess, onFailure) {
    var ret = target;

    if (typeof target === 'string' && target.search('@') !== -1) { //search only strings containing "@something"
      var reference_alias = target.replace('@', '');

      if (cation.has(reference_alias)) { //reference exists?
        if (!cation.hasLoaded(reference_alias)) {
          //reference exists but it's not loaded. proceed to load it..
          loadService(reference_alias, onSuccess, onFailure);
        }

        ret = service_bag[reference_alias].require;
      } else {
        // oops, the reference does not exists
        onFailure(parent_alias, 'The referenced service "' + reference_alias + '" does not exists.');
      }
    }

    return ret;
  };

  /**
   * Dynamically creates an object by giving the function and arguments to be injected on construction.
   *
   * @param  {Function} fn
   * @param  {array}   args
   * @return {object}
   */
  var dispatchObject = function(fn, args) {
    if (typeof fn === 'function') {
      return fn.apply(this, args || []);
    } else {
      return fn;
    }
  };


  /**
   * Loads all services in memory.
   */
  cation.ready = function() {
    for (var service_alias in service_bag) {
      loadService(service_alias, cation.onLoadSuccess, cation.onLoadError);
    }
  };

  /**
   * Success callback.
   *
   * @param  {string} service_alias
   * @return {}
   */
  cation.onLoadSuccess = function(service_alias) {
    return;
  };

  /**
   * Error callback.
   *
   * @param  {string} service_alias
   * @param  {string} err
   * @return {}
   */
  cation.onLoadError = function(service_alias, err) {
    throw new Error('Cation Service Container. Error loading "' + service_alias + '" service. ' + err);
  };

  // Finally, return the class.
  return cation;
};