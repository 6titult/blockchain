// scripts/fundExchangesWithInput.js
const { ethers } = require("hardhat");

async function main() {
  // Get the amount from command line arguments
  const inputAmount = 50;
  

  if (!inputAmount) {
    throw new Error("Please provide an amount as an argument (e.g., 1000)");
  }

  // Convert input to number and validate
  const amount = Number(inputAmount);
  if (isNaN(amount)) {
    throw new Error("Invalid amount - must be a number");
  }
  if (amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }

  // Replace with YOUR contract addresses
  const TOKEN_A_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const TOKEN_B_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const EXCHANGE_A_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const EXCHANGE_B_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

  const [deployer] = await ethers.getSigners();
  console.log(`Funding with ${amount} tokens using account: ${deployer.address}`);

  // Get contracts with explicit ABIs
  const ERC20ABI = ["function approve(address,uint256)"];
  const ExchangeABI = ["function addLiquidity(uint256,uint256)"];
  
  const tokenA = await ethers.getContractAt(ERC20ABI, TOKEN_A_ADDRESS);
  const tokenB = await ethers.getContractAt(ERC20ABI, TOKEN_B_ADDRESS);
  const exchangeA = await ethers.getContractAt(ExchangeABI, EXCHANGE_A_ADDRESS);
  const exchangeB = await ethers.getContractAt(ExchangeABI, EXCHANGE_B_ADDRESS);

  // Convert amounts using 18 decimals
  const toWei = (value) => ethers.parseUnits(value.toString(), 18);
  
  const amounts = {
    exchangeA: {
      tokenA: toWei(amount),
      tokenB: toWei(amount * 3) // Maintain 1:3 ratio
    },
    exchangeB: {
      tokenA: toWei(amount * 3), // Maintain 3:1 ratio
      tokenB: toWei(amount)
    }
  };

  // Helper function to fund an exchange
  async function fundExchange(exchange, tokenA, tokenB, amountA, amountB) {
    console.log(`\nFunding exchange at ${exchange.target} with:`);
    console.log(`- TokenA: ${ethers.formatUnits(amountA, 18)}`);
    console.log(`- TokenB: ${ethers.formatUnits(amountB, 18)}`);

    try {
      console.log("Approving TokenA...");
      await (await tokenA.approve(exchange.target, amountA)).wait();
      
      console.log("Approving TokenB...");
      await (await tokenB.approve(exchange.target, amountB)).wait();
      
      console.log("Adding liquidity...");
      const tx = await exchange.addLiquidity(amountA, amountB);
      await tx.wait();
      
      console.log("Funding successful!");
    } catch (error) {
      console.error("Funding failed:", error.reason || error.message);
      process.exit(1);
    }
  }

  // Fund Exchange A (1:3 ratio)
  await fundExchange(
    exchangeA,
    tokenA,
    tokenB,
    amounts.exchangeA.tokenA,
    amounts.exchangeA.tokenB
  );

  // Fund Exchange B (3:1 ratio)
  await fundExchange(
    exchangeB,
    tokenA,
    tokenB,
    amounts.exchangeB.tokenA,
    amounts.exchangeB.tokenB
  );

  console.log("\n✅ All exchanges funded successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error.message);
    process.exit(1);
  });