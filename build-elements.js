const fs = require('fs-extra');
const concat = require('concat');
(async function build() {
  const files = [
    './dist/lake7elements/runtime-es5.js',
    './dist/lake7elements/polyfills-es5.js',
    './dist/lake7elements/scripts.js',
    './dist/lake7elements/main-es5.js',
    './dist/lake7elements/5-es5.js'
  ]
  await fs.ensureDir('elements')
  await concat(files, 'elements/signup-form.js');
  await fs.copyFile('./dist/lake7elements/styles.css', 'elements/styles.css')

})()