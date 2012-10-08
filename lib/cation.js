var cation = module.exports = function(dir_aliases, modules) {
  cation.load_dirs = dir_aliases;
  cation.module_schema = modules;
  cation.module_store = {};

  return cation;
};

cation.load = function(name) {
  if (this.module_schema.hasOwnProperty(name)) {
    var module_path = this.module_schema[name];
    module_path = (module_path.search(':') !== -1) ? replaceParameters(module_path, this.load_dirs) : module_path;

    this.module_store[name] = require(module_path);
  }
};

cation.get = function(name) {
  if (!this.module_store.hasOwnProperty(name)) {
    this.load(name);
  }

  return this.module_store[name];
};

function replaceParameters(search, replacements) {
  var found_params  = search.match(/:([A-za-z0-9]+)/gi),
      purged_search = search;

  for (var i=0; i < found_params.length; i++) {
    var clean_param_name  = found_params[i].replace(':',''),
        replacement_value = replacements[clean_param_name];

    purged_search = purged_search.replace(found_params[i], replacement_value);
  }

  return purged_search;
}