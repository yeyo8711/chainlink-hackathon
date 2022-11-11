// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract PayrollioNFT is ERC1155, Ownable, ERC1155Burnable, ERC1155Supply {
    mapping(address => mapping(uint => bool)) addressToToken;

    constructor()
        ERC1155("/ipfs/QmTkYo6s8kRHMZNRxk1dF8BUKr6UNrwKXKYu7Dd6fXgEQo")
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
                    "https://aqua-just-grouse-834.mypinata.cloud/ipfs/QmTkYo6s8kRHMZNRxk1dF8BUKr6UNrwKXKYu7Dd6fXgEQo/",
                    Strings.toString(_tokenId),
                    ".json"
                )
            );
    }

    function setURI(string memory newuri) public onlyOwner {
        _setURI(newuri);
    }

    function mint(address account, uint256 id) public onlyOwner {
        require(
            balanceOf(account, id) < 1,
            "Cannot have more than one rank NFT"
        );
        _mint(account, id, 1, "");
        addressToToken[account][id] = true;
    }

    function mintEmployeeOfTheMonth(address account) public onlyOwner {
        _mint(account, 5, 1, "");
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
        addressToToken[account][id] = false;
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

    function getAccountsNFTs(address _address)
        public
        view
        returns (uint256[6] memory)
    {
        uint256[6] memory nfts;
        uint localCounter;
        for (uint i; i < 7; i++) {
            if (addressToToken[_address][i]) {
                nfts[localCounter] = i;
                localCounter += 1;
            }
        }

        return nfts;
    }
}
