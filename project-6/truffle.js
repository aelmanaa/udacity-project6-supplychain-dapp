// truffle migrate --reset --network rinkeby

const HDWalletProvider = require('@truffle/hdwallet-provider');

require('dotenv').config();

const infuraKey = process.env.INFURA_API_KEY || "";
const privateKeys = process.env.PRIVATE_KEYS || "";


module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 8545,
      network_id: "*" // Match any network id
    },
    rinkeby: {
      provider: () => new HDWalletProvider({
        privateKeys: privateKeys.split(','),
        providerOrUrl: `https://rinkeby.infura.io/v3/${infuraKey}`
      }),
      network_id: 4     // Rinkeby's id
    }
  },
  compilers: {
    solc: {
      version: "0.8.4",    // Fetch exact version from solc-bin (default: truffle's version)
      // docker: true,        // Use "0.5.1" you've installed locally with docker (default: false)
      settings: {          // See the solidity docs for advice about optimization and evmVersion
        optimizer: {
          enabled: true,
          runs: 200
        }
        //  evmVersion: "byzantium"
        // }
      },
    }
  }
}