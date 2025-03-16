const { ethers } = require("hardhat");

// ERC-20 ABI (without decimals fallback)
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)"
];

const TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

async function main() {
    const accounts = await ethers.getSigners();
    const provider = ethers.provider;

    // Connect to ERC-20 token contract
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    const decimals = 18; // Default to 18 decimals if method is missing

    console.log("Accounts, ETH Balances, and Token Balances:");

    for (const account of accounts) {
        // Get ETH balance
        const ethBalance = await provider.getBalance(account.address);
        console.log(`Address: ${account.address}`);
        console.log(`   ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

        // Get ERC-20 token balance
        try {
            const tokenBalance = await tokenContract.balanceOf(account.address);
            console.log(`   Token Balance: ${ethers.formatUnits(tokenBalance, decimals)} TOKEN`);
        } catch (error) {
            console.log("   Token Balance: Could not fetch (Invalid Contract or Not an ERC-20)");
        }
        
        console.log();
    }
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
