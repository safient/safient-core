const { utils, ethers } = require("ethers");
const fs = require("fs");
const chalk = require("chalk");

require("@nomiclabs/hardhat-waffle");

const defaultNetwork = "localhost"; // "hardhat" for tests
const INFURA_API_KEY = "ffffffffffffffffffffffffffffffff";
const TESTNET_ACCOUNT_PRIVATE_KEY = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";

module.exports = {
  defaultNetwork,
  networks: {
    localhost: {
      url: "http://localhost:8545", // uses account 0 of the hardhat node to deploy
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${TESTNET_ACCOUNT_PRIVATE_KEY}`],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${TESTNET_ACCOUNT_PRIVATE_KEY}`],
    },
    kovan: {
      url: `https://kovan.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${TESTNET_ACCOUNT_PRIVATE_KEY}`],
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${INFURA_API_KEY}`,
      accounts: [`0x${TESTNET_ACCOUNT_PRIVATE_KEY}`],
    },
  },
  solidity: {
    compilers: [
      {
        version: "0.7.0",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

task("accounts", "Prints the list of accounts", async () => {
  if (defaultNetwork === "localhost") {
    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545/");
    const accounts = await provider.listAccounts();
    for (let i = 0; i < accounts.length; i++) {
      const accountBalance = await provider.getBalance(accounts[i]);
      console.log("📄", chalk.cyan(accounts[i]), "💸", chalk.magenta(utils.formatEther(accountBalance), "ETH"));
    }
    console.log("\n");
  } else {
    console.log(
      " ⚠️  This task only runs on JsonRpcProvider running a node at " + chalk.magenta("localhost:8545") + "\n"
    );
  }
});
