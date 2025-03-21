// Import ethers from hardhat environment
const { ethers } = require("hardhat");

/**
 * Minimal ERC-20 ABI containing only balanceOf function
 * Note: This version doesn't include decimals() function,
 * making it more flexible for non-standard token contracts
 */
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)"
];

// Address of the token contract to check
// Note: This address is from local hardhat deployment
const TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

/**
 * Main function to display balances for all hardhat accounts
 * More resilient version that handles non-standard tokens
 * Shows both ETH and token balances with error handling
 */
async function main() {
    // Get all signers (accounts) from hardhat
    const accounts = await ethers.getSigners();
    const provider = ethers.provider;

    // Initialize the token contract interface with minimal ABI
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    // Assume standard 18 decimals since we don't check decimals()
    const decimals = 18; // Default to 18 decimals if method is missing

    console.log("Accounts, ETH Balances, and Token Balances:");

    // Iterate through all accounts and display their balances
    for (const account of accounts) {
        // Get and format native ETH balance
        const ethBalance = await provider.getBalance(account.address);
        console.log(`Address: ${account.address}`);
        console.log(`   ETH Balance: ${ethers.formatEther(ethBalance)} ETH`);

        // Try to get token balance with error handling
        // This is more robust as it won't fail if the contract
        // is invalid or doesn't implement the full ERC20 interface
        try {
            const tokenBalance = await tokenContract.balanceOf(account.address);
            console.log(`   Token Balance: ${ethers.formatUnits(tokenBalance, decimals)} TOKEN`);
        } catch (error) {
            console.log("   Token Balance: Could not fetch (Invalid Contract or Not an ERC-20)");
        }
        
        console.log();
    }
}

// Execute the main function and handle any errors
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
