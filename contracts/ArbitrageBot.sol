// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Exchange.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ArbitrageBot
 * @dev A smart contract that performs arbitrage between two exchanges
 * by taking advantage of price differences for the same token pair
 */
contract ArbitrageBot {
    // References to the two exchanges we'll perform arbitrage between
    Exchange public exchangeA;
    Exchange public exchangeB;
    
    // The two tokens we'll be trading between
    // token0 and token1 represent the trading pair (e.g., ETH/USDC)
    IERC20 public token0;
    IERC20 public token1;

    /**
     * @dev Constructor initializes the contract with addresses of exchanges and tokens
     * @param _exchangeA Address of the first exchange
     * @param _exchangeB Address of the second exchange
     * @param _token0 Address of the first token in the trading pair
     * @param _token1 Address of the second token in the trading pair
     */
    constructor(address _exchangeA, address _exchangeB, address _token0, address _token1) {
        exchangeA = Exchange(_exchangeA);
        exchangeB = Exchange(_exchangeB);
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    /**
     * @dev Executes the arbitrage operation between the two exchanges
     * @param amountIn The amount of token1 to start the arbitrage with
     * @notice This function checks prices on both exchanges and executes trades
     * if there's a profitable opportunity
     */
    function executeArbitrage(uint256 amountIn) external {
        // Get current prices from both exchanges
        uint256 priceA = exchangeA.getPrice();
        uint256 priceB = exchangeB.getPrice();

        if (priceA > priceB) {
            // If price on Exchange A is higher, buy from B and sell on A
            // 1. Transfer tokens from user to this contract
            token1.transferFrom(msg.sender, address(this), amountIn);
            // 2. Approve Exchange B to spend our tokens
            token1.approve(address(exchangeB), amountIn);
            // 3. Swap tokens on Exchange B
            uint256 amountOutB = exchangeB.swap(address(token1), amountIn);
            // 4. Approve Exchange A to spend the tokens we received
            token0.approve(address(exchangeA), amountOutB);
            // 5. Swap tokens on Exchange A
            uint256 finalAmount = exchangeA.swap(address(token0), amountOutB);
            // 6. Ensure we made a profit
            require(finalAmount > amountIn, "No profit");
        } else if (priceB > priceA) {
            // If price on Exchange B is higher, buy from A and sell on B
            // 1. Transfer tokens from user to this contract
            token1.transferFrom(msg.sender, address(this), amountIn);
            // 2. Approve Exchange A to spend our tokens
            token1.approve(address(exchangeA), amountIn);
            // 3. Swap tokens on Exchange A
            uint256 amountOutA = exchangeA.swap(address(token1), amountIn);
            // 4. Approve Exchange B to spend the tokens we received
            token0.approve(address(exchangeB), amountOutA);
            // 5. Swap tokens on Exchange B
            uint256 finalAmount = exchangeB.swap(address(token0), amountOutA);
            // 6. Ensure we made a profit
            require(finalAmount > amountIn, "No profit");
        }
    }

    /**
     * @dev Calculates potential profit for a given amount without executing the trade
     * @param amountIn The amount of token1 to simulate arbitrage with
     * @return profit The potential profit (in token1) from the arbitrage
     * @return direction True if arbitrage should go A->B, False if B->A
     */
    function calculateArbitrage(uint256 amountIn) public view returns (uint256 profit, bool direction) {
        uint256 priceA = exchangeA.getPrice();
        uint256 priceB = exchangeB.getPrice();
        
        if (priceA > priceB) {
            // Simulate buying from B and selling to A
            uint256 amountOutB = exchangeB.getAmountOut(address(token1), amountIn);
            uint256 finalAmount = exchangeA.getAmountOut(address(token0), amountOutB);
            if (finalAmount > amountIn) {
                return (finalAmount - amountIn, false);
            }
        } else if (priceB > priceA) {
            // Simulate buying from A and selling to B
            uint256 amountOutA = exchangeA.getAmountOut(address(token1), amountIn);
            uint256 finalAmount = exchangeB.getAmountOut(address(token0), amountOutA);
            if (finalAmount > amountIn) {
                return (finalAmount - amountIn, true);
            }
        }
        return (0, false); // No profitable arbitrage opportunity
    }

    /**
     * @dev Executes arbitrage if profitable for the given amount
     * @param amountIn The amount of token1 to perform arbitrage with
     * @return profit The actual profit made from the arbitrage
     */
    function performArbitrage(uint256 amountIn) external returns (uint256 profit) {
        (uint256 expectedProfit, bool direction) = calculateArbitrage(amountIn);
        require(expectedProfit > 0, "No profitable arbitrage opportunity");

        // Transfer tokens from user to this contract
        token1.transferFrom(msg.sender, address(this), amountIn);
        uint256 initialBalance = token1.balanceOf(address(this));

        if (direction) {
            // Execute A -> B arbitrage
            token1.approve(address(exchangeA), amountIn);
            uint256 amountOutA = exchangeA.swap(address(token1), amountIn);
            token0.approve(address(exchangeB), amountOutA);
            exchangeB.swap(address(token0), amountOutA);
        } else {
            // Execute B -> A arbitrage
            token1.approve(address(exchangeB), amountIn);
            uint256 amountOutB = exchangeB.swap(address(token1), amountIn);
            token0.approve(address(exchangeA), amountOutB);
            exchangeA.swap(address(token0), amountOutB);
        }

        // Calculate actual profit
        uint256 finalBalance = token1.balanceOf(address(this));
        require(finalBalance > initialBalance, "No profit made");
        profit = finalBalance - initialBalance;

        // Transfer profit back to user
        token1.transfer(msg.sender, finalBalance);
        return profit;
    }
}