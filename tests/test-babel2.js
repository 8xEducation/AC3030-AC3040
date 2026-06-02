const babel = require('@babel/core');
const fs = require('fs');
const path = './node_modules/react-native/Libraries/Animated/nodes/AnimatedValue.js';
const code = fs.readFileSync(path, 'utf8');

babel.transformAsync(code, {
  filename: path,
  presets: ['babel-preset-expo']
}).then(result => {
  console.log("--- COMPILED CODE ---");
  console.log("Success! Compiled AnimatedValue.js");
}).catch(err => {
  console.error("--- ERROR ---");
  console.error(err.message);
});
