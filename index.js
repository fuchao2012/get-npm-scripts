#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const root = process.cwd(); 

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
      let scripts = pkgJson['scripts'];

      packages[name] = {
        dist: path.join(pkg.root, pkg.name),
        packageJson: path.join(pkg.root, 'package.json'),
        scripts: scripts
      };
      return packages;
    }, {});

module.exports = { packages };

// test 
if (require.main === module) {
  /* eslint-disable no-console */
  console.log('Packages:');
  console.log(JSON.stringify(packages, null, 2));
}
