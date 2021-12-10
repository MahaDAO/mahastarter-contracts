// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract MockERC20 is ERC20PresetMinterPauser {
    constructor(string memory name, string memory symbol)
        ERC20PresetMinterPauser(name, symbol)
    {
        _mint(msg.sender, 100_000_000_000_000_000_000 * 10**18);
    }

    function faucet(address account, uint256 amount) external {
        _mint(account, amount);
    }
}
