// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BenefitsToken.sol";
import "./EmployeePayroll.sol";

contract Employees is Ownable {
    BenefitsToken public BEN;
    EmployeePayroll public payroll;
    uint256 public employeeCounter;

    struct Employee {
        string name;
        uint256 rank;
        uint256 dateOfBirth;
        uint256 salary;
        address walletAddress;
        bool active;
    }

    mapping(uint256 => Employee) public employees;
    mapping(address => bool) public isAdmin;

    event EmpoloyeeCreated(
        string indexed _name,
        uint256 _rank,
        uint256 _dob,
        uint256 _salary,
        address indexed _wallet
    );

    event EmpoloyeeReleased(
        string _name,
        uint256 _rank,
        uint256 _dob,
        uint256 _salary,
        address indexed _wallet
    );

    event AssignRank(uint256 _employeeID, uint256 _rank);

    constructor(address _BEN, address _payroll) {
        BEN = BenefitsToken(_BEN);
        payroll = EmployeePayroll(_payroll);
        isAdmin[msg.sender] = true;
    }

    // Create New Employee
    function addEmployee(
        string memory _name,
        uint256 _rank,
        uint256 _dob,
        uint256 _salary,
        address _wallet
    ) public {
        require(isAdmin[msg.sender], "Only Amins can call this function");
        Employee storage employee = employees[employeeCounter];
        employee.name = _name;
        employee.rank = _rank;
        employee.dateOfBirth = _dob;
        employee.salary = _salary;
        employee.walletAddress = _wallet;
        employee.active = true;

        unchecked {
            employeeCounter++;
        }

        BEN.mint(employee.walletAddress, employee.rank);

        emit EmpoloyeeCreated(_name, _rank, _dob, _salary, _wallet);
    }

    // Delete Employee
    function releaseEmployee(uint256 _employeeId) public {
        require(isAdmin[msg.sender], "Only Amins can call this function");
        require(_employeeId <= employeeCounter, "Employee ID does not exist");
        Employee storage employee = employees[_employeeId];
        employee.active = false;

        emit EmpoloyeeReleased(
            employee.name,
            employee.rank,
            employee.dateOfBirth,
            employee.salary,
            employee.walletAddress
        );

        unchecked {
            employeeCounter--;
        }
    }

    // Assign Role
    function assignRank(uint256 _employeeId, uint256 _rank) public {
        require(isAdmin[msg.sender], "Only Amins can call this function");
        require(_employeeId <= employeeCounter, "Employee ID does not exist");
        Employee storage employee = employees[_employeeId];
        employee.rank = _rank;

        emit AssignRank(_employeeId, _rank);
    }

    function getActiveEmployees() public view returns (Employee[] memory) {
        // Get all active employees
        Employee[] memory activeEmployeeArray = new Employee[](employeeCounter);
        for (uint256 i; i < employeeCounter; i++) {
            Employee memory employeeLoop = getEmployee(i);
            if (employeeLoop.active) {
                activeEmployeeArray[i] = employeeLoop;
            }
        }
        return activeEmployeeArray;

        // call mint contract to pay
    }

    function replenishEmployeeTokens() public {
        Employee[] memory activeEmployeesArr = getActiveEmployees();
        for (uint i; i < activeEmployeesArr.length; i++) {
            uint256 tokenBalance = BEN.balanceOf(
                activeEmployeesArr[i].walletAddress
            );
            uint256 tokensForRank = BEN.getAmountToRank(
                activeEmployeesArr[i].rank
            );
            if (tokenBalance < tokensForRank) {
                BEN.replenish(
                    activeEmployeesArr[i].walletAddress,
                    tokensForRank - tokenBalance
                );
            }
        }
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

    // Setter Functions
    function setAdmin(address _address, bool _isAdmin) external onlyOwner {
        isAdmin[_address] = _isAdmin;
    }
}
