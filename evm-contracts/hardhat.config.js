require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();

module.exports = {
  solidity: "0.8.28",
  networks: {
    flowEVMTestnet: {
      url: "https://testnet.evm.nodes.onflow.org", // Flow EVM Testnet RPC endpoint
      accounts: [process.env.PRIVATE_KEY],
    },
    flowEVMMainnet: {
      url: "https://mainnet.evm.nodes.onflow.org", // Flow EVM Mainnet RPC endpoint
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
