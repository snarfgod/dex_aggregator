require("@nomiclabs/hardhat-waffle");

require('dotenv').config();

module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.ALCHEMY_API_KEY}`,
      }
    }
  },
  solidity: "0.8.9",
};
