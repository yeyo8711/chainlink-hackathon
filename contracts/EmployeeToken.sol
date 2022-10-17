// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Employees.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EmployeeToken is ERC20, ERC20Burnable, Ownable {
    address employeeContract;
    uint256 immutable rank1Amount = 100_000;
    uint256 immutable rank2Amount = 150_000;
    uint256 immutable rank3Amount = 200_000;
    uint256 immutable rank4Amount = 300_000;
    mapping(address => bool) public isAdmin;

    modifier onlyEmployeeContract() {
        require(msg.sender == employeeContract);
        _;
    }

    constructor() ERC20("EmployeeToken", "EMP") {
        isAdmin[msg.sender] = true;
    }

    function updateEmployeeContract(address _address) public {
        require(isAdmin[msg.sender]);
        employeeContract = _address;
    }

    function mint(address to, uint256 _rank) public onlyEmployeeContract {
        if (_rank == 1) {
            _mint(to, rank1Amount);
        } else if (_rank == 2) {
            _mint(to, rank2Amount);
        } else if (_rank == 3) {
            _mint(to, rank3Amount);
        } else {
            _mint(to, rank4Amount);
        }
    }

    function burn(uint256 amount) public override virtual {
        require(balanceOf(msg.sender) > 0, 'No tokens to burn');
        amount = balanceOf(msg.sender);
        _burn(_msgSender(), amount);
    }

    

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override onlyEmployeeContract {
        require(from != address(0), "ERC20: transfer from the zero address");
        require(to != address(0), "ERC20: transfer to the zero address");

        super._transfer(from, to, amount);
    }
}
