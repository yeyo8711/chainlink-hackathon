// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./Employees.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract EmployeePayroll is ERC20, ERC20Burnable, Ownable {
    Employees public employeeContract;
    address employeeContractAddress;
    mapping(address => bool) public isAdmin;
    Employee[] public employeeArray;

    struct Employee {
        string name;
        uint256 rank;
        uint256 dateOfBirth;
        uint256 salary;
        address walletAddress;
        bool active;
    }

    modifier onlyEmployeeContract() {
        require(msg.sender == employeeContractAddress);
        _;
    }

    constructor() ERC20("EmployeeUSD", "EMPUSD") {
        isAdmin[msg.sender] = true;
    }

    function mint(address _to, uint256 _amount) public onlyEmployeeContract {
        _mint(_to, _amount * 10**decimals());
    }

    /*---------- SETTERS AND GETTERS -------------*/
    function updateEmployeeContractAddress(address _address) public {
        require(isAdmin[msg.sender]);
        employeeContractAddress = _address;
    }

    function updateEmployeeContract(address _address) public onlyOwner {
        employeeContract = Employees(_address);
    }

    function setAdmin(address _address, bool _isAdmin) external onlyOwner {
        isAdmin[_address] = _isAdmin;
    }
}
