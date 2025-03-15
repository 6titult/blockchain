const { ethers } = require("hardhat");

async function main() {
  // Replace with your token addresses
  const TOKEN_A_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const TOKEN_B_ADDRESS = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";

  // Replace with the recipient address (e.g., Account #1 from Hardhat node)
  const RECIPIENT_ADDRESS = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";

  // Amounts to transfer (100 TKA and 100 TKB)
  const AMOUNT = ethers.parseUnits("100", 18);

  // Get deployer account
  const [deployer] = await ethers.getSigners();

  // Get token contracts
  const tokenA = await ethers.getContractAt("TokenA", TOKEN_A_ADDRESS);
  const tokenB = await ethers.getContractAt("TokenB", TOKEN_B_ADDRESS);

  // Transfer TokenA
  await (await tokenA.connect(deployer).transfer(RECIPIENT_ADDRESS, AMOUNT)).wait();
  console.log("Transferred 100 TKA to", RECIPIENT_ADDRESS);

  // Transfer TokenB
  await (await tokenB.connect(deployer).transfer(RECIPIENT_ADDRESS, AMOUNT)).wait();
  console.log("Transferred 100 TKB to", RECIPIENT_ADDRESS);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });