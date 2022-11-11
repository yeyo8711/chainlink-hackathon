// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./BenefitsToken.sol";
import "./EmployeePayroll.sol";
import "./PayrollioNFT.sol";

contract Employees is Ownable {
    BenefitsToken public BEN;
    EmployeePayroll public PAYROLL;
    uint256 public employeeCounter = 0;
    PayrollioNFT public NFT;

    struct CompanyData {
        uint256 totalEmployees;
        uint256 activeEmployees;
        uint256 inactiveEmployees;
        uint256 rank1Employees;
        uint256 rank2Employees;
        uint256 rank3Employees;
        uint256 rank4Employees;
    }

    struct Employee {
        string name;
        uint256 rank;
        uint256 dateOfBirth;
        uint256 salary;
        address walletAddress;
        bool active;
        uint256 daysToNextPay;
    }

    CompanyData[1] public companyData;
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
    event EmployeePaid(string _name, address _wallet, uint256 _amount);

    constructor(
        address _BEN,
        address _payroll,
        address _nft
    ) {
        BEN = BenefitsToken(_BEN);
        PAYROLL = EmployeePayroll(_payroll);
        NFT = PayrollioNFT(_nft);
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
        require(_rank > 0 && _rank < 5, "Rank doesnt exist");
        Employee storage employee = employees[employeeCounter];
        employee.name = _name;
        employee.rank = _rank;
        employee.dateOfBirth = _dob;
        employee.salary = _salary;
        employee.walletAddress = _wallet;
        employee.active = true;
        employee.daysToNextPay = 30;

        CompanyData storage data = companyData[0];
        data.totalEmployees += 1;
        data.activeEmployees += 1;
        if (_rank == 1) {
            data.rank1Employees += 1;
        } else if (_rank == 2) {
            data.rank2Employees += 1;
        } else if (_rank == 3) {
            data.rank3Employees += 1;
        } else {
            data.rank4Employees += 1;
        }

        unchecked {
            employeeCounter++;
        }

        //Mint NFTs and Benefit Tokens
        BEN.mint(employee.walletAddress, employee.rank);

        NFT.mint(employee.walletAddress, _rank);

        emit EmpoloyeeCreated(_name, _rank, _dob, _salary, _wallet);
    }

    // Delete Employee
    function releaseEmployee(uint256 _employeeId) public {
        require(isAdmin[msg.sender], "Only Amins can call this function");
        require(_employeeId <= employeeCounter, "Employee ID does not exist");
        Employee storage employee = employees[_employeeId];
        require(employee.active, "Employee already released");
        employee.active = false;

        CompanyData storage data = companyData[0];
        data.totalEmployees += 1;
        data.activeEmployees += 1;
        if (employee.rank == 1) {
            data.rank1Employees -= 1;
        } else if (employee.rank == 2) {
            data.rank2Employees -= 1;
        } else if (employee.rank == 3) {
            data.rank3Employees -= 1;
        } else {
            data.rank4Employees -= 1;
        }

        emit EmpoloyeeReleased(
            employee.name,
            employee.rank,
            employee.dateOfBirth,
            employee.salary,
            employee.walletAddress
        );
        // Liquidate
        uint256 salaryPerDay = employee.salary / 365;
        uint256 pendingPay = employee.daysToNextPay * salaryPerDay;
        PAYROLL.mint(employee.walletAddress, pendingPay);
        employee.daysToNextPay = 0;
        // Burn NFTS
        for (uint i; i < employee.rank + 1; i++) {
            if (NFT.balanceOf(employee.walletAddress, i) > 0)
                NFT.burn(employee.walletAddress, i, 1);
        }
        // Mint Ex-Employee NFT
        NFT.mint(employee.walletAddress, 6);
    }

    // Assign Role
    function assignRank(
        uint256 _employeeId,
        uint256 _rank,
        uint256 _salary
    ) public {
        require(isAdmin[msg.sender], "Only Amins can call this function");
        require(_employeeId <= employeeCounter, "Employee ID does not exist");
        Employee storage employee = employees[_employeeId];
        require(_rank > employee.rank, "Cannot demote employee");
        require(_rank < 5, "This rank doenst exist");
        employee.rank = _rank;
        employee.salary = _salary;

        NFT.mint(employee.walletAddress, _rank);

        emit AssignRank(_employeeId, _rank);
    }

    /* ----------------- BENEFITS TOKEN ---------------*/
    function replenishEmployeeTokens() public {
        Employee[] memory activeEmployeesArr = getActiveEmployees();
        for (uint i; i < activeEmployeesArr.length; i++) {
            if (activeEmployeesArr[i].active) {
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
    }

    /* ----------- PAYROLL ----------- */
    function payActiveEmployees() public {
        for (uint i; i < employeeCounter; i++) {
            if (employees[i].active) {
                if (employees[i].daysToNextPay > 1) {
                    employees[i].daysToNextPay -= 1;
                } else {
                    employees[i].daysToNextPay = 30;
                    PAYROLL.mint(
                        employees[i].walletAddress,
                        employees[i].salary / 12
                    );
                    emit EmployeePaid(
                        employees[i].name,
                        employees[i].walletAddress,
                        employees[i].salary / 12
                    );
                }
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

    function getActiveEmployees() public view returns (Employee[] memory) {
        Employee[] memory activeEmployeeArray = new Employee[](employeeCounter);

        for (uint256 i; i < employeeCounter; i++) {
            Employee memory employeeLoop = getEmployee(i);
            if (employeeLoop.active) {
                activeEmployeeArray[i] = employeeLoop;
            }
        }

        return activeEmployeeArray;
    }

    // Setter Functions
    function setAdmin(address _address, bool _isAdmin) external onlyOwner {
        isAdmin[_address] = _isAdmin;
    }
}
