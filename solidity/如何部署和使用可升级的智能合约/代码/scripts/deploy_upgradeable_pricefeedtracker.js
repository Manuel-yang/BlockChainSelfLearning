// The Open Zeppelin upgrades plugin adds the `upgrades` property
// to the Hardhat Runtime Environment.
const { ethers, network, upgrades } = require("hardhat");

async function main() {
 // Obtain reference to contract and ABI.
 const PriceFeedTracker = await ethers.getContractFactory("PriceFeedTracker");
 console.log("Deploying PriceFeedTracker to ", network.name);

 // Get the first account from the list of 20 created for you by Hardhat
 const [account1] = await ethers.getSigners();

 //  Deploy logic contract using the proxy pattern.
 const pricefeedTracker = await upgrades.deployProxy(
   PriceFeedTracker,

   //Since the logic contract has an initialize() function
   // we need to pass in the arguments to the initialize()
   // function here.
   [account1.address],

   // We don't need to expressly specify this
   // as the Hardhat runtime will default to the name 'initialize'
   { initializer: "initialize" }
 );
 await pricefeedTracker.deployed();

 console.log("PriceFeedTracker deployed to:", pricefeedTracker.address);
}

main();