// TokenA.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title TokenA
 * @dev An ERC20 token implementation for testing and demonstration purposes
 * Inherits from OpenZeppelin's ERC20 implementation
 */
contract TokenA is ERC20 {
    /**
     * @dev Constructor creates a new ERC20 token with:
     * - Name: "TokenA"
     * - Symbol: "TKA"
     * - Initial supply: 1 million tokens (with decimals)
     * @notice All tokens are minted to the contract deployer
     */
    constructor() ERC20("TokenA", "TKA") {
        // Mint 1 million tokens to the deployer
        // Uses decimals() from ERC20 (default 18) for proper decimal places
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }
}