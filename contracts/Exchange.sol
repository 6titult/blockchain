// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title Exchange
 * @dev A simple Automated Market Maker (AMM) exchange contract that handles
 * a pair of ERC20 tokens using a constant product formula (x * y = k)
 */
contract Exchange {
    // The two tokens in the trading pair
    IERC20 public token0;
    IERC20 public token1;

    // Liquidity reserves for each token
    uint256 public reserve0;
    uint256 public reserve1;

    /**
     * @dev Constructor initializes the exchange with two token addresses
     * @param _token0 Address of the first token in the pair
     * @param _token1 Address of the second token in the pair
     */
    constructor(address _token0, address _token1) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    /**
     * @dev Allows users to add liquidity to the exchange
     * @param amount0 Amount of token0 to add
     * @param amount1 Amount of token1 to add
     * @notice This function increases the reserves of both tokens
     */
    function addLiquidity(uint256 amount0, uint256 amount1) external {
        // Transfer both tokens from the user to the exchange
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);
        // Update the reserves
        reserve0 += amount0;
        reserve1 += amount1;
    }

    /**
     * @dev Calculates and returns the current exchange rate
     * @return Price of token0 denominated in token1 with 18 decimals precision
     * @notice Price = (reserve1 * 1e18) / reserve0
     */
    function getPrice() public view returns (uint256) {
        return (reserve1 * 1e18) / reserve0; // Price of token0 in token1
    }

    /**
     * @dev Executes a token swap based on the AMM formula
     * @param inputToken Address of the token being sold
     * @param amountIn Amount of input tokens to sell
     * @return amountOut The amount of output tokens received
     * @notice Uses constant product formula (x * y = k) with a 0.3% fee
     */
    function swap(address inputToken, uint256 amountIn) external returns (uint256) {
        // Verify the input token is one of the pair
        require(inputToken == address(token0) || inputToken == address(token1), "Invalid token");
        
        // Set up reserves based on which token is being input
        (uint256 x, uint256 y) = inputToken == address(token0) ? (reserve0, reserve1) : (reserve1, reserve0);
        
        // Calculate amount out using constant product formula with 0.3% fee
        uint256 amountInWithFee = (amountIn * 997) / 1000; // 0.3% fee
        uint256 amountOut = (amountInWithFee * y) / (x + amountInWithFee);
        
        // Execute the token transfers
        IERC20(inputToken).transferFrom(msg.sender, address(this), amountIn);
        IERC20(inputToken == address(token0) ? token1 : token0).transfer(msg.sender, amountOut);
        
        // Update reserves based on which token was input
        if (inputToken == address(token0)) {
            reserve0 += amountIn;
            reserve1 -= amountOut;
        } else {
            reserve1 += amountIn;
            reserve0 -= amountOut;
        }
        return amountOut;
    }
}