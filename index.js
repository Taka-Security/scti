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

const findLastFnDefinition = (fnName) => {
	for (let i = json.ast.nodes.length - 1; i >= 0; i -= 1) {
		const outerNode = json.ast.nodes[i];
		if (outerNode.nodeType !== 'ContractDefinition') continue;
		for (let j = 0; j < outerNode.nodes.length; j += 1) {
			const innerNode = outerNode.nodes[j];
			if (innerNode.nodeType !== 'FunctionDefinition' && innerNode.nodeType !== 'VariableDeclaration') continue;
			if (innerNode.name === fnName) return innerNode;
		}
	}
}


json.abi.forEach((fn) => {
	if (fn.type === 'constructor' || fn.type === 'event') return;
	const fnNode = findLastFnDefinition(fn.name);
	// if (fn.name === 'symbol') console.log({ fnNode });
  res += '    function ';
  if (fn.type === 'function') res += fn.name; // otherwise it's fallback function
  res += '(';

  if (fn.inputs && fn.inputs.length) {
    const args = fn.inputs.map((inp, idx) => {
			const paramNode = fnNode && fnNode.nodeType === 'FunctionDefinition' && fnNode.parameters.parameters[idx];
			let inpStr = inp.type;
			if (fnNode && fnNode.nodeType === 'FunctionDefinition' && paramNode.storageLocation !== 'default') inpStr += ` ${paramNode.storageLocation}`;
      if (inp.name) inpStr += ` ${inp.name}`;
			return inpStr;
    }).join(', ');

    res += args;
  }
  res += ') ';

  if (fn.stateMutability && fn.stateMutability != 'nonpayable') res += `${fn.stateMutability} `;
	res += (!fnNode || fnNode.nodeType === 'VariableDeclaration') ? 'public' : fnNode.visibility;
	if (!fn.outputs || !fn.outputs.length) res += ';\n';
  else {
    res += ' returns('
    const out_args = fn.outputs.map((outp, idx) => {
			const paramNode = fnNode && fnNode.nodeType === 'FunctionDefinition' && fnNode.returnParameters.parameters[idx];
			let outpStr = outp.type;
			if (fnNode && fnNode.nodeType === 'FunctionDefinition' && paramNode.storageLocation !== 'default') outpStr += ` ${paramNode.storageLocation}`;
			else if (outp.type === 'bytes' || outp.type === 'string' || outp.type.includes('[]')) outpStr += ' memory';
			if (outp.name) outpStr += ` ${outp.name}`;
			return outpStr;
    }).join(', ');

    res += out_args;
    res += ');\n'
  }
});

res += '}';

console.log(res);