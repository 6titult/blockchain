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
}