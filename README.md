# scti

**s**olidity **c**ontract **t**o **i**nterface


![License](https://img.shields.io/github/license/rmi7/scti.svg?style=flat-square)
[![Version](https://img.shields.io/npm/v/scti.svg?style=flat-square&label=version)](https://www.npmjs.com/package/scti)
![Download](https://img.shields.io/npm/dt/scti.svg)

given a truffle json file, convert the abi to a Solidity abstract contract/interface.

## Usage

#### without install

```
npx scti ~/my-truffle-project/build/json/MyContract.json
```

#### with install

```
npm i -g scti
scti ~/my-truffle-project/build/json/MyContract.json
```

## Output

The output will be printed to stdout, which you can redirect to a file:

```
npx scti ~/my-truffle-project/build/json/MyContract.json > MyContractInterface.sol
```

## License

MIT