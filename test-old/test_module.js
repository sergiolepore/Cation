var test_service = module.exports = function(encoding, inspect) {
  test_service.encoding = encoding;
  test_service.inspect = inspect;

  test_service.check = function(param) {
    console.log('>> test_service.js - Starting check...');
    console.log('    - Injected parameter for function "check": ' + param);
    console.log('    - Injected constructor argument for encoding: ' + test_service.encoding);
    console.log('    - Injected constructor argument for inspect: ' + typeof test_service.inspect);
    console.log('<< Ending check...\n');
  };

  test_service.getEncoding = function() {
    return test_service.encoding;
  };

  return test_service;
};