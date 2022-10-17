// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Employees.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EmployeePayroll is ERC20, ERC20Burnable, Ownable {
    address employeeContract;
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
}
