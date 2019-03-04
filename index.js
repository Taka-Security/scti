#!/usr/bin/env node

const process = require('process');
const fs = require('fs');
const path = require('path');

const jsonDir = process.argv[2] || null;

if (!jsonDir) {
	console.log('missing contract json file path');
	process.exit(1);
}

const getAbsolutePath = (inputPath) => {
  const normalizedInputPath = path.normalize(inputPath);
  // use path.resolve to remove the ending slash if it's a directory, needed
  // for comparing srcDir with destDir
  return path.resolve(path.isAbsolute(normalizedInputPath)
    ? normalizedInputPath
    : path.join(process.cwd(), normalizedInputPath));
};

const thePath = getAbsolutePath(jsonDir);

const json = require(thePath);

let res = `contract ${json.contractName} {\n`;

json.abi.forEach((fn) => {
  if (fn.type === 'constructor' || fn.type === 'event') return;

  res += '    function ';
  if (fn.type === 'function') res += fn.name;
  res += '(';

  if (fn.inputs && fn.inputs.length) {
    const args = fn.inputs.map((inp) => {
      if (inp.name) {
        return `${inp.type} ${inp.name}`;
      } else {
        return `${inp.type}`;
      }
    }).join(', ');

    res += args;
  }
  res += ') ';

  if (fn.stateMutability && fn.stateMutability != 'nonpayable') res += `${fn.stateMutability} `

	res += 'external';

	if (!fn.outputs || !fn.outputs.length) res += ';\n';
  else {
    res += ' returns('
    const out_args = fn.outputs.map((outp) => {
      if (outp.name) {
        return `${outp.type} ${outp.name}`;
      } else {
        return `${outp.type}`;
      }
    }).join(', ');
    res += out_args;
    res += ');\n'
  }
});

res += '}';

console.log(res);