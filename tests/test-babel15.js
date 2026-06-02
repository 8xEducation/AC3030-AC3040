const babel = require('@babel/core');
const fs = require('fs');
const path = './node_modules/react-native/src/private/webapis/errors/DOMException.js';
const code = fs.readFileSync(path, 'utf8');

const config = require('../babel.config.js')({ cache: () => {} });

babel.transformAsync(code, {
  filename: path,
  ...config,
  caller: {
    name: 'metro',
    bundler: 'metro',
    engine: 'hermes',
    platform: 'ios',
    supportsStaticImports: true,
    isDev: false,
  }
}).then(result => {
  console.log("--- DOMException.js transpiled ---");
  console.log(result.code.includes('_wrapNativeSuper') ? 'HAS _wrapNativeSuper' : 'NO _wrapNativeSuper');
  console.log(result.code.includes('_defineProperty') ? 'HAS _defineProperty' : 'NO _defineProperty');
  console.log(result.code.includes('class DOMException') ? 'HAS ES6 CLASS' : 'NO ES6 CLASS');
}).catch(err => {
  console.error(err);
});
