// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PayrollioNFT is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    uint256 constant rank1 = 1;
    uint256 constant rank2 = 2;
    uint256 constant rank3 = 3;

    constructor()
        ERC1155("/ipfs/QmQeDk9TeJuGBubqv3JKNvD4pxaXPDoUATZNuw588ecX4m")
    {}

    function uri(uint256 _tokenId)
        public
        pure
        override
        returns (string memory)
    {
        return
            string(
                abi.encodePacked(
                    "https://gateway.pinata.cloud/ipfs/QmQeDk9TeJuGBubqv3JKNvD4pxaXPDoUATZNuw588ecX4m/",
                    Strings.toString(_tokenId),
                    ".json"
                )
            );
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(
        address account,
        uint256 id,
        uint256 amount,
        bytes memory data
    ) public onlyOwner {
        require(
            balanceOf(account, id) < 1,
            "Cannot have more than one rank NFT"
        );
        _mint(account, id, amount, data);
    }

    function burn(
        address account,
        uint256 id,
        uint256 amount
    ) public override {
        require(
            msg.sender == address(this) || msg.sender == owner(),
            "You cannot burn your own NFT"
        );
        _burn(account, id, amount);
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal override(ERC1155, ERC1155Supply) {
        require(
            msg.sender == address(this) || msg.sender == owner(),
            "You cannot transfer your NFT to others"
        );
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
}
