var cation = module.exports = function(dir, modules) {
  cation.load_dir = dir + '/';
  cation.module_schema = modules;
  cation.module_store = {};

  return cation;
};

cation.load = function(name) {
  if (this.module_schema.hasOwnProperty(name)) {
    var module_path = this.module_schema[name];
    module_path = (module_path.indexOf('.') === 0) ? this.load_dir + module_path : module_path;

    this.module_store[name] = require(module_path);
  }
};

cation.get = function(name) {
  if (!this.module_store.hasOwnProperty(name)) {
    this.load(name);
  }

  return this.module_store[name];
};