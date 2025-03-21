// Import ethers from hardhat environment
const { ethers } = require("hardhat");

/**
 * Minimal ERC-20 ABI containing only the functions we need:
 * - balanceOf: to check token balances
 * - decimals: to get token decimal places for formatting
 */
const ERC20_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
    "function decimals() view returns (uint8)"
];

// Address of the deployed TokenA contract
// Note: This address is from local hardhat deployment
const TOKEN_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

/**
 * Main function to display balances for all hardhat accounts
 * Shows both native token (GO) and TokenA balances for each account
 */
async function main() {
    // Get all signers (accounts) from hardhat
    const accounts = await ethers.getSigners();
    const provider = ethers.provider;

    // Initialize the token contract interface
    const tokenContract = new ethers.Contract(TOKEN_ADDRESS, ERC20_ABI, provider);
    // Get token decimals for proper formatting
    const decimals = await tokenContract.decimals();

    console.log("Accounts, ETH Balances, and Token Balances:");

    // Iterate through all accounts and display their balances
    for (const account of accounts) {
        // Get and format native token (GO) balance
        const ethBalance = await provider.getBalance(account.address);
        const ethBalanceFormatted = ethers.formatEther(ethBalance);

        // Get and format ERC-20 token (TokenA) balance
        const tokenBalance = await tokenContract.balanceOf(account.address);
        const tokenBalanceFormatted = ethers.formatUnits(tokenBalance, decimals);

        // Display the balances
        console.log(`Address: ${account.address}`);
        console.log(`   GO Balance: ${ethBalanceFormatted} GO`);
        console.log(`   TokenA Balance: ${tokenBalanceFormatted} TKA\n`);
    }
}

// Execute the main function and handle any errors
main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});
