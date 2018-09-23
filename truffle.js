/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() {
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>')
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

var HDWalletProvider = require("truffle-hdwallet-provider");
var infura_apikey = "38d19f292e624f15b6ab4a7fdc572da5";
var mnemonic = "barrel strong favorite receive ancient donate sentence brush huge unique chronic when";

 module.exports = {
   networks: {
     development: {
       host: "127.0.0.1",
       port: 7545,
       gas: 6721975,
       network_id: "5777"
     },
     ropsten:  {
      provider: new HDWalletProvider(mnemonic, "https://ropsten.infura.io/" + infura_apikey),
      network_id: 3,
      gas: 4612388
    }
   },
   solc: {
      optimizer: {
        enabled: true,
        runs: 200
      }
   }
 };
