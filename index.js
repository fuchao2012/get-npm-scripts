#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

//polyfill
if (!Object.keys) {
  Object.keys = (function () {
    var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;

    return function (obj) {
      if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');

      var result = [];

      for (var prop in obj) {
        if (hasOwnProperty.call(obj, prop)) result.push(prop);
      }

      if (hasDontEnumBug) {
        for (var i=0; i < dontEnumsLength; i++) {
          if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
        }
      }
      return result;
    }
  })()
};

// todo: use argv to accept path
const root = process.cwd(); 

console.log('Analysising ...');
const packages =
  glob.sync(path.join(root, '**/package.json'))
    .filter(p => !p.match(/node_modules/))
    .map(pkgPath => path.relative(root, path.dirname(pkgPath)))
    .map(pkgName => {
      return { name: pkgName, root: path.join(root, pkgName) };
    })
    .reduce((packages, pkg) => {
      let pkgJson = JSON.parse(fs.readFileSync(path.join(pkg.root, 'package.json'), 'utf8'));
      let name = pkgJson['name'];

      packages[name] = {
        packageJsonPath: path.join(pkg.root, 'package.json'),
        scripts: pkgJson['scripts']
      };
      return packages;
    }, {});

module.exports = { packages };

// test 
if (require.main === module) {
  console.log(`Packages: ${Object.keys(packages).length}`);
  console.log(JSON.stringify(packages, null, 2));
  let scriptsSumup = {};
  console.log(`Scripts: `)
  Object.keys(packages).forEach(p=>{
    Object.keys(packages[p].scripts).forEach(key=>{
      if(scriptsSumup[key] === undefined){
        scriptsSumup[key] ={
          count : 1,
          details: []
        }
        scriptsSumup[key].details.push({
            project: p,
            script: `${key}: ${packages[p].scripts[key]}` 
        })
      }else{
        scriptsSumup[key].count++;
        scriptsSumup[key].details.push({
          project: p,
          script: `${key}: ${packages[p].scripts[key]}` 
      })
      }      
    })
  })
  console.log(JSON.stringify(scriptsSumup, null, 2));
}
