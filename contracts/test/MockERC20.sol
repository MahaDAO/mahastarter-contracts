// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/presets/ERC20PresetMinterPauser.sol";

contract MockERC20 is ERC20PresetMinterPauser {
    constructor() ERC20PresetMinterPauser("ScallopX", "SCLP") {
        _mint(msg.sender, 10000 * 10**18);
    }
}
