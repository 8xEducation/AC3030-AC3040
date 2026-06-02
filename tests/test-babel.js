const babel = require('@babel/core');
const fs = require('fs');
const path = './node_modules/react-native/Libraries/Core/DOMException.js';
const code = fs.readFileSync(path, 'utf8');

babel.transformAsync(code, {
  filename: path,
  configFile: './babel.config.js',
}).then(result => {
  console.log("--- COMPILED CODE ---");
  console.log(result.code.includes('_wrapNativeSuper') ? 'HAS _wrapNativeSuper' : 'NO _wrapNativeSuper');
  console.log(result.code.includes('_defineProperty') ? 'HAS _defineProperty' : 'NO _defineProperty');
  console.log("First 15 lines:");
  console.log(result.code.split('\n').slice(0, 15).join('\n'));
}).catch(err => {
  console.error(err);
});
