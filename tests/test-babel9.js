const babel = require('@babel/core');
const fs = require('fs');
const path = './node_modules/react-native/src/private/webapis/errors/DOMException.js';
const code = fs.readFileSync(path, 'utf8');

const config = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    ['@babel/plugin-transform-class-properties', { loose: false }],
    ['@babel/plugin-transform-private-methods', { loose: false }],
    ['@babel/plugin-transform-private-property-in-object', { loose: false }],
  ]
};

babel.transformAsync(code, {
  filename: path,
  ...config,
  caller: {
    name: 'metro',
    bundler: 'metro',
    engine: 'hermes',
    platform: 'ios',
    supportsStaticImports: true,
    isDev: true,
  }
}).then(result => {
  console.log("--- COMPILED CODE WITH GLOBAL LOOSE FALSE ---");
  console.log(result.code.includes('_wrapNativeSuper') ? 'HAS _wrapNativeSuper' : 'NO _wrapNativeSuper');
  console.log(result.code.includes('_defineProperty') ? 'HAS _defineProperty' : 'NO _defineProperty');
  console.log(result.code.includes('class DOMException') ? 'HAS ES6 CLASS' : 'NO ES6 CLASS');
}).catch(err => {
  console.error(err);
});
