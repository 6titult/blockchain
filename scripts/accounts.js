const { ethers } = require("hardhat");

// ERC-20 ABI (Minimal)
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

// Token contract address
const TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
    const accounts = await ethers.getSigners();
    const provider = ethers.provider;

    // Connect to the ERC-20 token contract
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const decimals = await tokenContract.decimals();

    console.log("Accounts, ETH Balances, and Token Balances:");

    for (const account of accounts) {
        // Get ETH balance
        const ethBalance = await provider.getBalance(account.address);
        const ethBalanceFormatted = ethers.formatEther(ethBalance);

        // Get ERC-20 token balance
        const tokenBalance = await tokenContract.balanceOf(account.address);
        const tokenBalanceFormatted = ethers.formatUnits(tokenBalance, decimals);

        console.log(`Address: ${account.address}`);
        console.log(`   GO Balance: ${ethBalanceFormatted} GO`);
        console.log(`   TokenA Balance: ${tokenBalanceFormatted} TKA\n`);
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
