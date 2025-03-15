const { ethers } = require("hardhat");

async function main() {
  // Replace with YOUR addresses
  const TOKEN_A_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512"; // TokenA
  const TOKEN_B_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0"; // TokenB
  const EXCHANGE_A_ADDRESS = "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"; // ExchangeA
  const EXCHANGE_B_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9"; // ExchangeB

  const [deployer] = await ethers.getSigners();
  console.log("Funding with account:", deployer.address);

  // Get contracts
  const tokenA = await ethers.getContractAt("TokenA", TOKEN_A_ADDRESS);
  const tokenB = await ethers.getContractAt("TokenB", TOKEN_B_ADDRESS);
  const exchangeA = await ethers.getContractAt("Exchange", EXCHANGE_A_ADDRESS);
  const exchangeB = await ethers.getContractAt("Exchange", EXCHANGE_B_ADDRESS);

  // Convert amounts to wei (18 decimals)
  const amountAExchangeA = ethers.parseUnits("1000", 18); // 1000 TokenA for ExchangeA
  const amountBExchangeA = ethers.parseUnits("3000", 18); // 3000 TokenB for ExchangeA
  const amountAExchangeB = ethers.parseUnits("3000", 18); // 3000 TokenA for ExchangeB
  const amountBExchangeB = ethers.parseUnits("1000", 18); // 1000 TokenB for ExchangeB

  // Fund ExchangeA
  console.log("Approving TokenA for ExchangeA...");
  await (await tokenA.connect(deployer).approve(exchangeA.target, amountAExchangeA)).wait();
  console.log("Approving TokenB for ExchangeA...");
  await (await tokenB.connect(deployer).approve(exchangeA.target, amountBExchangeA)).wait();
  console.log("Adding liquidity to ExchangeA...");
  await (await exchangeA.addLiquidity(amountAExchangeA, amountBExchangeA)).wait();
  console.log("ExchangeA funded!");

  // Fund ExchangeB
  console.log("Approving TokenA for ExchangeB...");
  await (await tokenA.connect(deployer).approve(exchangeB.target, amountAExchangeB)).wait();
  console.log("Approving TokenB for ExchangeB...");
  await (await tokenB.connect(deployer).approve(exchangeB.target, amountBExchangeB)).wait();
  console.log("Adding liquidity to ExchangeB...");
  await (await exchangeB.addLiquidity(amountAExchangeB, amountBExchangeB)).wait();
  console.log("ExchangeB funded!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error.message);
    process.exit(1);
  });