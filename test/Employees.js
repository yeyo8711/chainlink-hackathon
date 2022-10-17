const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, hre } = require("hardhat");
// Helpers
const toWei = (num) => ethers.utils.parseEther(num.toString());
const fromWei = (num) => ethers.utils.formatEther(num);

describe("Employees", async function () {
  let deployer,
    account1,
    account2,
    account3,
    account4,
    employees,
    token,
    payroll;

  before("Deploys Contracts", async function () {
    // Get Signers
    [deployer, account1, account2, account3] = await ethers.getSigners();

    // Deploy Token Contract
    const EmployeeToken = await ethers.getContractFactory("EmployeeToken");
    token = await EmployeeToken.deploy();
    await token.deployed();
    console.log("EmployeeToken deployed at:", token.address);

    // Deploy Payroll Contract
    const Payroll = await ethers.getContractFactory("EmployeePayroll");
    payroll = await Payroll.deploy();
    await payroll.deployed();
    console.log("Payroll deployed at:", payroll.address);

    // Deploy Employee Contract
    const Employee = await ethers.getContractFactory("Employees");
    employees = await Employee.deploy(token.address, payroll.address);
    await employees.deployed();
    console.log("Employees deployed at:", employees.address);

    // Update Contract Address
    await token.updateEmployeeContract(employees.address);
    await payroll.updateEmployeeContract(employees.address);
  });

  describe("Deployed with correct owner", function () {
    it("Should have the right owner", async function () {
      const owner = await employees.owner();
      expect(owner).to.equal(deployer.address);
    });
  });

  describe("Create Employee", function () {
    before("Should create new employee", async function () {
      await employees.addEmployee(
        "John Doe",
        1,
        111987,
        50000,
        1,
        account3.address
      );
    });

    it("Should confirm creation of employee", async function () {
      const employee1 = await employees.employees(0);

      expect(employee1.name).to.equal("John Doe");
      expect(employee1.rank).to.equal(1);
      expect(employee1.dateOfBirth).to.equal(111987);
      expect(employee1.salary).to.equal(50000);
      expect(employee1.voteWeight).to.equal(1);
      expect(employee1.walletAddress).to.equal(account3.address);
      expect(employee1.active).to.equal(true);
    });

    it("Should mint tokens to employee", async function () {
      const balance = await token.balanceOf(account3.address);
      expect(balance).to.equal(100000);
    });
  });
  describe("Release Employee", function () {
    it("Should release employee", async function () {
      await employees.releaseEmployee(0);
      const employee1 = await employees.employees(0);
      expect(employee1.active).to.equal(false);
    });
    it("Employee Burns tokens", async function () {
      await token.connect(account3).burn(token.balanceOf(account3.address));
      const balance = await token.balanceOf(account3.address);
      expect(balance).to.equal(0);
    });
    it("Revert if ID doesnt exist", async function () {
      await expect(employees.releaseEmployee(2)).to.be.revertedWith(
        "Employee ID does not exist"
      );
    });
    it("Revert if caller is not Admin", async function () {
      await expect(
        employees.connect(account2).releaseEmployee(2)
      ).to.be.revertedWith("Only Amins can call this function");
    });
  });

  describe("Assign Employee Rank", function () {
    it("Change Rank", async function () {
      await employees.assignRank(0, 2);
      const employee1 = await employees.employees(0);
      expect(employee1.rank).to.equal(2);
    });
    it("Revert if ID doesnt exist", async function () {
      await expect(employees.assignRank(2, 1)).to.be.revertedWith(
        "Employee ID does not exist"
      );
    });
    it("Revert if caller is not Admin", async function () {
      await expect(
        employees.connect(account2).releaseEmployee(2)
      ).to.be.revertedWith("Only Amins can call this function");
    });
  });
});
