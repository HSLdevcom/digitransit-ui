/* eslint-disable import/no-extraneous-dependencies */
import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { describe, it } from 'mocha';

const directory = path.join(__dirname, '..');
let modules = [];
fs.readdirSync(directory).forEach(name => {
  if (name.includes('digitransit-component')) {
    const pckgPath = path.join(directory, name, 'package.json');
    if (fs.existsSync(pckgPath)) {
      const pckg = JSON.parse(fs.readFileSync(pckgPath));
      modules.push({
        name,
        pckg,
        dir: path.join(directory, name),
        dependencies: pckg.dependencies || {},
        devDependencies: pckg.devDependencies || {},
      });
    }
  }
});

const mainModule = modules.filter(m => m.name === 'digitransit-component');
const cntDependencies = Object.keys(mainModule[0].dependencies).length;

// Exclude main digitransit-component module
modules = modules.filter(({ name }) => name !== 'digitransit-component');

describe('Testing @digitransit-component module', () => {
  it('Checking that count of modules is greater or equal than count of dependencies', () => {
    expect(modules.length).to.have.gte(cntDependencies);
  });
});
