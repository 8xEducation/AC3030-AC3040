const babel = require('@babel/core');
const fs = require('fs');
const path = './node_modules/react-native/src/private/webapis/errors/DOMException.js';
const code = fs.readFileSync(path, 'utf8');

babel.transformAsync(code, {
  filename: path,
  presets: ['babel-preset-expo'],
  plugins: [
    ['@babel/plugin-transform-classes', { loose: true }],
  ],
  caller: {
    name: 'metro',
    bundler: 'metro',
    engine: 'hermes',
    platform: 'ios',
    supportsStaticImports: true,
    isDev: false,
  }
}).then(result => {
  console.log(result.code.includes('_wrapNativeSuper') ? 'HAS _wrapNativeSuper' : 'NO _wrapNativeSuper');
  console.log(result.code);
});
