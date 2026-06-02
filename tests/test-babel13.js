const babel = require('@babel/core');
const fs = require('fs');
const path = './node_modules/react-native/Libraries/Debugging/DebuggingOverlayRegistry.js';
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
    isDev: false, // production mode!
  }
}).then(result => {
  console.log(result.code.includes('#registry') ? 'HAS #registry - FAILED TO STRIP' : 'STRIPPED #registry');
}).catch(err => {
  console.error(err);
});
