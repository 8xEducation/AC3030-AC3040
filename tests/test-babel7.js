const babel = require('@babel/core');
const fs = require('fs');
const path = './node_modules/react-native/src/private/webapis/errors/DOMException.js';
const code = fs.readFileSync(path, 'utf8');

babel.transformAsync(code, {
  filename: path,
  presets: ['babel-preset-expo'],
  plugins: [
    ['@babel/plugin-transform-class-properties', { loose: true }],
    ['@babel/plugin-transform-private-methods', { loose: true }],
    ['@babel/plugin-transform-private-property-in-object', { loose: true }],
  ],
  caller: {
    name: 'metro',
    bundler: 'metro',
    engine: 'hermes',
    platform: 'ios',
    supportsStaticImports: true,
    isDev: true,
  }
}).then(result => {
  console.log("--- COMPILED CODE WITH METRO CALLER AND LOOSE PLUGINS ---");
  console.log(result.code.includes('_wrapNativeSuper') ? 'HAS _wrapNativeSuper' : 'NO _wrapNativeSuper');
  console.log(result.code.includes('_defineProperty') ? 'HAS _defineProperty' : 'NO _defineProperty');
  console.log(result.code.includes('class DOMException') ? 'HAS ES6 CLASS' : 'NO ES6 CLASS');
  console.log("First 15 lines:");
  console.log(result.code.split('\n').slice(0, 15).join('\n'));
}).catch(err => {
  console.error(err);
});
