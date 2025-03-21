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

  // Step 4: Add initial liquidity to exchanges with different ratios
  console.log("\nAdding initial liquidity to exchanges...");
  
  // Approve tokens for both exchanges
  const liquidityAmountA1 = ethers.parseUnits("1000", 18);
  const liquidityAmountB1 = ethers.parseUnits("3000", 18);
  const liquidityAmountA2 = ethers.parseUnits("3000", 18);
  const liquidityAmountB2 = ethers.parseUnits("1000", 18);

  // Approve and add liquidity to Exchange A (1:3 ratio)
  await tokenA.approve(exchangeA.target, liquidityAmountA1);
  await tokenB.approve(exchangeA.target, liquidityAmountB1);
  await exchangeA.addLiquidity(liquidityAmountA1, liquidityAmountB1);
  console.log("Added liquidity to Exchange A (1:3 ratio)");

  // Approve and add liquidity to Exchange B (3:1 ratio)
  await tokenA.approve(exchangeB.target, liquidityAmountA2);
  await tokenB.approve(exchangeB.target, liquidityAmountB2);
  await exchangeB.addLiquidity(liquidityAmountA2, liquidityAmountB2);
  console.log("Added liquidity to Exchange B (3:1 ratio)");

  // Test arbitrage calculation with 1000 tokens
  const testAmount = ethers.parseUnits("1000", 18);
  
  try {
    // First calculate potential arbitrage
    const [profit, direction] = await bot.calculateArbitrage(testAmount);
    console.log("\nArbitrage Test Results:");
    console.log("Test amount:", ethers.formatUnits(testAmount, 18), "tokens");
    console.log("Potential profit:", ethers.formatUnits(profit, 18), "tokens");
    console.log("Direction:", direction ? "A->B" : "B->A");
    
    if (profit > 0) {
      console.log("Arbitrage opportunity found!");
      
      // Step 5: Perform the arbitrage if profitable
      console.log("\nExecuting arbitrage...");
      
      // Approve TokenB for the bot to use
      await tokenB.approve(bot.target, testAmount);
      
      // Execute the arbitrage
      const tx = await bot.performArbitrage(testAmount);
      const receipt = await tx.wait();
      
      // Get the actual profit from the transaction events
      const actualProfit = await tokenB.balanceOf(deployer.address) - testAmount;
      
      console.log("Arbitrage execution completed!");
      console.log("Transaction hash:", receipt.hash);
      console.log("Actual profit:", ethers.formatUnits(actualProfit, 18), "tokens");
    } else {
      console.log("No profitable arbitrage opportunity at this time.");
    }
  } catch (error) {
    console.error("Error during arbitrage:", error.message);
  }
}

// Execute the deployment script and handle any errors
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});