const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy Tokens
  const TokenA = await ethers.getContractFactory("TokenA");
  const tokenA = await TokenA.deploy();
  console.log("TokenA address:", await tokenA.getAddress());

  const TokenB = await ethers.getContractFactory("TokenB");
  const tokenB = await TokenB.deploy();
  console.log("TokenB address:", await tokenB.getAddress());

  // Deploy Exchanges
  const Exchange = await ethers.getContractFactory("Exchange");
  const exchangeA = await Exchange.deploy(tokenA.target, tokenB.target);
  console.log("ExchangeA address:", exchangeA.target);

  const exchangeB = await Exchange.deploy(tokenA.target, tokenB.target);
  console.log("ExchangeB address:", exchangeB.target);

  // Deploy Arbitrage Bot
  const ArbitrageBot = await ethers.getContractFactory("ArbitrageBot");
  const bot = await ArbitrageBot.deploy(
    exchangeA.target,
    exchangeB.target,
    tokenA.target,
    tokenB.target
  );
  console.log("ArbitrageBot address:", bot.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});