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

const contractNode = json.ast.nodes.find(item => item.name === json.contractName);

json.abi.forEach((fn) => {
  if (fn.type === 'constructor' || fn.type === 'event') return;
	const fnNode = contractNode.nodes.find(item => item.nodeType === 'FunctionDefinition' && item.name === fn.name);

  res += '    function ';
  if (fn.type === 'function') res += fn.name;
  res += '(';

  if (fn.inputs && fn.inputs.length) {
    const args = fn.inputs.map((inp, idx) => {
			const paramNode = fnNode && fnNode.parameters.parameters[idx];
			let inpStr = inp.type;
			if (fnNode && paramNode.storageLocation !== 'default') inpStr += ` ${paramNode.storageLocation}`;
      if (inp.name) inpStr += ` ${inp.name}`;
			return inpStr;
    }).join(', ');

    res += args;
  }
  res += ') ';

  if (fn.stateMutability && fn.stateMutability != 'nonpayable') res += `${fn.stateMutability} `

	res += 'external';

	if (!fn.outputs || !fn.outputs.length) res += ';\n';
  else {
    res += ' returns('
    const out_args = fn.outputs.map((outp, idx) => {
			const paramNode = fnNode && fnNode.returnParameters.parameters[idx];
			let outpStr = outp.type;
			if (fnNode && paramNode.storageLocation !== 'default') outpStr += ` ${paramNode.storageLocation}`;
			if (outp.name) outpStr += ` ${outp.name}`;
			return outpStr;
    }).join(', ');

    res += out_args;
    res += ');\n'
  }
});

res += '}';

console.log(res);