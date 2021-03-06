/*-----------------------------------------------------------------------------
| Copyright (c) Jupyter Development Team.
| Distributed under the terms of the Modified BSD License.
|----------------------------------------------------------------------------*/

import * as fs from 'fs-extra';
import * as path from 'path';
import * as glob from 'glob';
import { readJSONFile } from './utils';

// Get all of the packages.
let basePath = path.resolve('.');
let baseConfig = readJSONFile(path.join(basePath, 'package.json'));
let packageConfig = baseConfig.workspaces;
let skipSource = process.argv.indexOf('packages') === -1;
let skipExamples = process.argv.indexOf('examples') === -1;

// Handle the packages
for (let i = 0; i < packageConfig.length; i++) {
  if (skipSource && packageConfig[i] === 'packages/*') {
    continue;
  }
  if (skipExamples && packageConfig[i] === 'examples/*') {
    continue;
  }
  let files = glob.sync(path.join(basePath, packageConfig[i]));
  for (let j = 0; j < files.length; j++) {
    try {
      handlePackage(files[j]);
    } catch (e) {
      console.error(e);
    }
  }
}

/**
 * Handle an individual package on the path - update the dependency.
 */
function handlePackage(packagePath: string): void {
  // Read in the package.json.
  packagePath = path.join(packagePath, 'package.json');
  let data: any;
  try {
    data = require(packagePath);
  } catch (e) {
    console.log('skipping', packagePath);
    return;
  }
  if (!data.scripts || !data.scripts.clean) {
    return;
  }
  let targets = data.scripts.clean.split('&&');
  for (let i = 0; i < targets.length; i++) {
    let target = targets[i].replace('rimraf', '').trim();
    target = path.join(packagePath, target);
    if (fs.existsSync(target)) {
      fs.removeSync(target);
    }
  }
}
