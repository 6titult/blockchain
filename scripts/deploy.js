// Import ethers from hardhat environment
const { ethers } = require("hardhat");

/**
 * Main deployment script that handles the deployment of all contracts:
 * - TokenA and TokenB (ERC20 tokens)
 * - Two Exchange contracts (ExchangeA and ExchangeB)
 * - ArbitrageBot contract
 * 
 * The script deploys the contracts in the correct order to ensure
 * proper dependency injection and prints all deployment addresses
 */
async function main() {
  // Get the deployer's account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Step 1: Deploy the ERC20 tokens
  // Deploy TokenA - First token for the trading pair
  const TokenA = await ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy();
  console.log("TokenA address:", await tokenA.getAddress());

  // Deploy TokenB - Second token for the trading pair
  const TokenB = await ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy();
  console.log("TokenB address:", await tokenB.getAddress());

  // Step 2: Deploy the Exchange contracts
  // Each exchange will handle the same token pair (TokenA/TokenB)
  const Exchange = await ethers.getContractFactory("Exchange");
  
  // Deploy first exchange (ExchangeA)
  const exchangeA = await Exchange.deploy(tokenA.target, tokenB.target);
  console.log("ExchangeA address:", exchangeA.target);

  // Deploy second exchange (ExchangeB)
  const exchangeB = await Exchange.deploy(tokenA.target, tokenB.target);
  console.log("ExchangeB address:", exchangeB.target);

  // Step 3: Deploy the ArbitrageBot
  // Bot will monitor and execute trades between ExchangeA and ExchangeB
  const ArbitrageBot = await ethers.getContractFactory("ArbitrageBot");
  const bot = await ArbitrageBot.deploy(
    exchangeA.target,
    exchangeB.target,
    tokenA.target,
    tokenB.target
  );
  console.log("ArbitrageBot address:", bot.target);
}

// Execute the deployment script and handle any errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});