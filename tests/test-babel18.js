process.env.NODE_ENV = 'production';
const babel = require('@babel/core');
const fs = require('fs');
const path = './node_modules/react-native/src/private/webapis/geometry/DOMRectReadOnly.js';
const code = fs.readFileSync(path, 'utf8');

babel.transformAsync(code, {
  filename: path,
  presets: ['babel-preset-expo'],
  caller: {
    name: 'metro',
    bundler: 'metro',
    engine: 'hermes',
    platform: 'ios',
    supportsStaticImports: true,
    isDev: false,
  }
}).then(result => {
  console.log(result.code.includes('#width') ? 'HAS #width - FAILED TO STRIP' : 'STRIPPED #width');
}).catch(err => {
  console.error(err);
});
