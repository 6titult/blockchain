// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./Exchange.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ArbitrageBot {
    Exchange public exchangeA;
    Exchange public exchangeB;
    IERC20 public token0;
    IERC20 public token1;

    constructor(address _exchangeA, address _exchangeB, address _token0, address _token1) {
        exchangeA = Exchange(_exchangeA);
        exchangeB = Exchange(_exchangeB);
        token0 = IERC20(_token0);
        token1 = IERC20(_token1);
    }

    function executeArbitrage(uint256 amountIn) external {
        uint256 priceA = exchangeA.getPrice();
        uint256 priceB = exchangeB.getPrice();

        if (priceA > priceB) {
            // Buy from B, sell to A
            token1.transferFrom(msg.sender, address(this), amountIn);
            token1.approve(address(exchangeB), amountIn);
            uint256 amountOutB = exchangeB.swap(address(token1), amountIn);
            token0.approve(address(exchangeA), amountOutB);
            uint256 finalAmount = exchangeA.swap(address(token0), amountOutB);
            require(finalAmount > amountIn, "No profit");
        } else if (priceB > priceA) {
            // Buy from A, sell to B (similar logic)
        }
    }
}