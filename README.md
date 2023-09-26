# DEX Aggregator

## Introduction

This project is a simple DEX aggregator that quotes the exchange with the best price and executes a swap on that exchange.  It can swap WETH, DAI, and MATIC across Uniswap, Sushiswap, or Shibaswap. It is built on top of the [Hardhat](https://hardhat.org/) framework.

## Usage

```npm install```

```npx hardhat node --network hardhat```

```npx hardhat run scripts/deploy.js --network localhost```

```npx hardhat run scripts/seed.js --network localhost```

```npm run start```

## Testing

```npx hardhat test```

## Creator

[David Ports](https://github.com/snarfgod)
