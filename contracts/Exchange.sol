// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Exchange {
    IERC20 public token0;
    IERC20 public token1;
    uint256 public reserve0;
    uint256 public reserve1;

    constructor(address _token0, address _token1) {
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    function addLiquidity(uint256 amount0, uint256 amount1) external {
        token0.transferFrom(msg.sender, address(this), amount0);
        token1.transferFrom(msg.sender, address(this), amount1);
        reserve0 += amount0;
        reserve1 += amount1;
    }

    function getPrice() public view returns (uint256) {
        return (reserve1 * 1e18) / reserve0; // Price of token0 in token1
    }

    function swap(address inputToken, uint256 amountIn) external returns (uint256) {
        require(inputToken == address(token0) || inputToken == address(token1), "Invalid token");
        
        (uint256 x, uint256 y) = inputToken == address(token0) ? (reserve0, reserve1) : (reserve1, reserve0);
        uint256 amountInWithFee = (amountIn * 997) / 1000; // 0.3% fee
        uint256 amountOut = (amountInWithFee * y) / (x + amountInWithFee);
        
        IERC20(inputToken).transferFrom(msg.sender, address(this), amountIn);
        IERC20(inputToken == address(token0) ? token1 : token0).transfer(msg.sender, amountOut);
        
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