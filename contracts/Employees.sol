// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./EmployeeToken.sol";
import "./EmployeePayroll.sol";

contract Employees is Ownable {
    EmployeeToken public EMP;
    EmployeePayroll public payroll;
    uint256 public counter;

    struct Employee {
        string name;
        uint256 rank;
        uint256 dateOfBirth;
        uint256 salary;
        uint256 voteWeight;
        address walletAddress;
        bool active;
    }

    mapping(uint256 => Employee) public employees;
    mapping(address => bool) public isAdmin;

    event EmpoloyeeCreated(
        string _name,
        uint256 _rank,
        uint256 _dob,
        uint256 _salary,
        uint256 _vWeight,
        address indexed _wallet
    );

    event EmpoloyeeReleased(
        string _name,
        uint256 _rank,
        uint256 _dob,
        uint256 _salary,
        uint256 _vWeight,
        address indexed _wallet
    );

    constructor(address _EMP, address _payroll) {
        EMP = EmployeeToken(_EMP);
        payroll = EmployeePayroll(_payroll);
        isAdmin[msg.sender] = true;
    }

    // Create New Employee
    function addEmployee(
        string memory _name,
        uint256 _rank,
        uint256 _dob,
        uint256 _salary,
        uint256 _vWeight,
        address _wallet
    ) public {
        require(isAdmin[msg.sender], "Only Amins can call this function");
        Employee storage employee = employees[counter];
        employee.name = _name;
        employee.rank = _rank;
        employee.dateOfBirth = _dob;
        employee.salary = _salary;
        employee.voteWeight = _vWeight;
        employee.walletAddress = _wallet;
        employee.active = true;

        unchecked {
            counter++;
        }

        EMP.mint(employee.walletAddress, employee.rank);

        emit EmpoloyeeCreated(_name, _rank, _dob, _salary, _vWeight, _wallet);
    }

    // Delete Employee
    function releaseEmployee(uint256 _employeeId) public {
        require(isAdmin[msg.sender], "Only Amins can call this function");
        require(_employeeId <= counter, "Employee ID does not exist");
        Employee storage employee = employees[_employeeId];
        employee.active = false;

        emit EmpoloyeeReleased(
            employee.name,
            employee.rank,
            employee.dateOfBirth,
            employee.salary,
            employee.voteWeight,
            employee.walletAddress
        );
    }

    // Assign Role
    function assignRank(uint256 _employeeId, uint256 _rank) public  {
        require(isAdmin[msg.sender], "Only Amins can call this function");
        require(_employeeId <= counter, "Employee ID does not exist");
        Employee storage employee = employees[_employeeId];
        employee.rank = _rank;
    }

    // Getter Functions
    function getEmployee(uint256 _employeeId)
        public
        view
        returns (Employee memory)
    {
        Employee storage employee = employees[_employeeId];
        return employee;
    }
}
