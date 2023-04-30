require('dotenv').config()
require("@nomiclabs/hardhat-ethers");
require("@openzeppelin/hardhat-upgrades");

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL_HTTP
const PRIVATE_KEY = process.env.WALLET_PRIVATE_KEY_DEV1;
const ETHERSCAN_KEY = process.env.ETHERSCAN_API_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
 solidity: "0.8.17",
 defaultNetwork: "hardhat",
 networks: {
   localhost: {
     chainId: 31337,
   },
   sepolia: {
     url: SEPOLIA_RPC_URL,
     accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
     chainId: 11155111,
   },
 },
 etherscan: {
   apiKey: ETHERSCAN_KEY,
 },
};