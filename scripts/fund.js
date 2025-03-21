// Import ethers from hardhat environment
const { ethers } = require("hardhat");

/**
 * Minimal ABI for Exchange contract
 * Only includes the addLiquidity function needed for funding
 */
const ExchangeABI = [
  "function addLiquidity(uint256 amount0, uint256 amount1) external"
];

/**
 * Minimal ABI for ERC20 tokens
 * Includes only necessary functions:
 * - approve: to allow exchanges to spend tokens
 * - balanceOf: to check token balances
 */
const ERC20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

/**
 * Main function to fund both exchanges with initial liquidity
 * Creates different price points in each exchange to enable arbitrage:
 * - ExchangeA: 1 TokenA = 3 TokenB (1:3 ratio)
 * - ExchangeB: 3 TokenA = 1 TokenB (3:1 ratio)
 */
async function main() {
  // Get the deployer's account (will be used to fund the exchanges)
  const [deployer] = await ethers.getSigners();
  console.log("Funding with account:", deployer.address);

  // Contract addresses from deployment
  // Note: Replace these addresses with actual deployed contract addresses
  const TOKEN_A_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const TOKEN_B_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const EXCHANGE_A_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const EXCHANGE_B_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  // Initialize contract interfaces with minimal ABIs
  const tokenA = await ethers.getContractAt(ERC20ABI, TOKEN_A_ADDRESS);
  const tokenB = await ethers.getContractAt(ERC20ABI, TOKEN_B_ADDRESS);
  const exchangeA = await ethers.getContractAt(ExchangeABI, EXCHANGE_A_ADDRESS);
  const exchangeB = await ethers.getContractAt(ExchangeABI, EXCHANGE_B_ADDRESS);

  // Verify contracts are deployed by checking their bytecode
  console.log("TokenA code:", (await ethers.provider.getCode(TOKEN_A_ADDRESS)).slice(0, 50) + "...");
  console.log("ExchangeA code:", (await ethers.provider.getCode(EXCHANGE_A_ADDRESS)).slice(0, 50) + "...");

  // Define liquidity amounts for each exchange
  // ExchangeA: 1000 TokenA : 3000 TokenB (1:3 ratio)
  const amountAExchangeA = ethers.parseUnits("1000", 18);
  const amountBExchangeA = ethers.parseUnits("3000", 18);
  // ExchangeB: 3000 TokenA : 1000 TokenB (3:1 ratio)
  const amountAExchangeB = ethers.parseUnits("3000", 18);
  const amountBExchangeB = ethers.parseUnits("1000", 18);

  try {
    // Fund Exchange A with 1:3 ratio
    console.log("\n=== Funding Exchange A ===");
    // Approve Exchange A to spend TokenA
    let tx = await tokenA.approve(exchangeA.target, amountAExchangeA);
    await tx.wait();
    
    // Approve Exchange A to spend TokenB
    tx = await tokenB.approve(exchangeA.target, amountBExchangeA);
    await tx.wait();
    
    // Add liquidity to Exchange A
    tx = await exchangeA.addLiquidity(amountAExchangeA, amountBExchangeA);
    await tx.wait();
    console.log("ExchangeA funded successfully!");

    // Fund Exchange B with 3:1 ratio (opposite of Exchange A)
    console.log("\n=== Funding Exchange B ===");
    // Approve Exchange B to spend TokenA
    tx = await tokenA.approve(exchangeB.target, amountAExchangeB);
    await tx.wait();
    
    // Approve Exchange B to spend TokenB
    tx = await tokenB.approve(exchangeB.target, amountBExchangeB);
    await tx.wait();
    
    // Add liquidity to Exchange B
    tx = await exchangeB.addLiquidity(amountAExchangeB, amountBExchangeB);
    await tx.wait();
    console.log("ExchangeB funded successfully!");

  } catch (error) {
    // Detailed error handling with transaction information
    console.error("\n Transaction failed:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Transaction hash:", error.transaction?.hash);
    process.exit(1);
  }
}

// Execute the funding script and handle any errors
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });