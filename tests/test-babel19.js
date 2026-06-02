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
  console.log(result.code);
});
