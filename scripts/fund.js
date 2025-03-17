const { ethers } = require("hardhat");

const ExchangeABI = [
  "function addLiquidity(uint256 amount0, uint256 amount1) external"
];

const ERC20ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)"
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Funding with account:", deployer.address);

  // Replace with your actual addresses
  const TOKEN_A_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const TOKEN_B_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const EXCHANGE_A_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const EXCHANGE_B_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  // Initialize contracts with explicit ABIs
  const tokenA = await ethers.getContractAt(ERC20ABI, TOKEN_A_ADDRESS);
  const tokenB = await ethers.getContractAt(ERC20ABI, TOKEN_B_ADDRESS);
  const exchangeA = await ethers.getContractAt(ExchangeABI, EXCHANGE_A_ADDRESS);
  const exchangeB = await ethers.getContractAt(ExchangeABI, EXCHANGE_B_ADDRESS);

  // Verify contracts
  console.log("TokenA code:", (await ethers.provider.getCode(TOKEN_A_ADDRESS)).slice(0, 50) + "...");
  console.log("ExchangeA code:", (await ethers.provider.getCode(EXCHANGE_A_ADDRESS)).slice(0, 50) + "...");

  const amountAExchangeA = ethers.parseUnits("1000", 18);
  const amountBExchangeA = ethers.parseUnits("3000", 18);
  const amountAExchangeB = ethers.parseUnits("3000", 18);
  const amountBExchangeB = ethers.parseUnits("1000", 18);

  try {
    // Fund Exchange A
    console.log("\n=== Funding Exchange A ===");
    let tx = await tokenA.approve(exchangeA.target, amountAExchangeA);
    await tx.wait();
    
    tx = await tokenB.approve(exchangeA.target, amountBExchangeA);
    await tx.wait();
    
    tx = await exchangeA.addLiquidity(amountAExchangeA, amountBExchangeA);
    await tx.wait();
    console.log("ExchangeA funded successfully!");

    // Fund Exchange B
    console.log("\n=== Funding Exchange B ===");
    tx = await tokenA.approve(exchangeB.target, amountAExchangeB);
    await tx.wait();
    
    tx = await tokenB.approve(exchangeB.target, amountBExchangeB);
    await tx.wait();
    
    tx = await exchangeB.addLiquidity(amountAExchangeB, amountBExchangeB);
    await tx.wait();
    console.log("ExchangeB funded successfully!");

  } catch (error) {
    console.error("\n Transaction failed:");
    console.error("Error message:", error.message);
    console.error("Error code:", error.code);
    console.error("Transaction hash:", error.transaction?.hash);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Unhandled error:", error);
    process.exit(1);
  });