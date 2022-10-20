const helpers = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers, hre } = require("hardhat");

describe("Employees", async function () {
  let deployer,
    account1,
    account2,
    account3,
    account4,
    account5,
    employees,
    benefitsToken,
    payroll;

  before("Deploys Contracts", async function () {
    // Get Signers
    [deployer, account1, account2, account3, account4, account5] =
      await ethers.getSigners();

    // Deploy Token Contract
    const BenefitsToken = await ethers.getContractFactory("BenefitsToken");
    benefitsToken = await BenefitsToken.deploy();
    await benefitsToken.deployed();
    console.log("BenefitsToken deployed at:", benefitsToken.address);

    // Deploy Payroll Contract
    const Payroll = await ethers.getContractFactory("EmployeePayroll");
    payroll = await Payroll.deploy();
    await payroll.deployed();
    console.log("Payroll deployed at:", payroll.address);

    // Deploy Employee Contract
    const Employee = await ethers.getContractFactory("Employees");
    employees = await Employee.deploy(benefitsToken.address, payroll.address);
    await employees.deployed();
    console.log("Employees deployed at:", employees.address);

    // Update Contract Address
    await benefitsToken.updateEmployeeContract(employees.address);
    await payroll.updateEmployeeContractAddress(employees.address);
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
        account3.address
      );
    });

    it("Should confirm creation of employee", async function () {
      const employee1 = await employees.employees(0);

      expect(employee1.name).to.equal("John Doe");
      expect(employee1.rank).to.equal(1);
      expect(employee1.dateOfBirth).to.equal(111987);
      expect(employee1.salary).to.equal(50000);
      expect(employee1.walletAddress).to.equal(account3.address);
      expect(employee1.active).to.equal(true);
    });

    it("Should mint benefitsTokens to employee", async function () {
      const balance = await benefitsToken.balanceOf(account3.address);
      expect(balance).to.equal(100000);
    });
  });
  describe("Release Employee", function () {
    it("Should release employee", async function () {
      await employees.releaseEmployee(0);
      const employee1 = await employees.employees(0);
      expect(employee1.active).to.equal(false);
    });
    it("Employee Burns benefitsTokens", async function () {
      await benefitsToken
        .connect(account3)
        .burn(benefitsToken.balanceOf(account3.address));
      const balance = await benefitsToken.balanceOf(account3.address);
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

  describe("Benefits Token", function () {
    let employeeArray;
    before("Creates new employees", async function () {
      await employees.addEmployee(
        "John Doe",
        1,
        111987,
        50000,
        account2.address
      );
      await employees.addEmployee(
        "Joao Doe",
        1,
        111987,
        50000,
        account3.address
      );
      await employees.addEmployee(
        "Jay Doe",
        1,
        111987,
        50000,
        account4.address
      );
      await employees.addEmployee(
        "Toby Doe",
        1,
        111987,
        50000,
        account5.address
      );
      await employees.releaseEmployee(4);
    });

    it("John spends tokens on break", async function () {
      await benefitsToken.connect(account2).buyExtraBreak();
      expect(await benefitsToken.balanceOf(account2.address)).to.equal(90000);
    });
    it("John spends tokens on lunch", async function () {
      await benefitsToken.connect(account2).buyLunch();
      expect(await benefitsToken.balanceOf(account2.address)).to.equal(80000);
    });
    it("John tries to buy day off and TX reverts ", async function () {
      await expect(
        benefitsToken.connect(account2).buyDayOff()
      ).to.be.revertedWith("ERC20: burn amount exceeds balance");
    });
    it("Retrieves employee array from main contract", async function () {
      employeeArray = await employees.getActiveEmployees();
      expect(typeof employeeArray).to.equal("object");
    });
    it("Replenishes tokens to all active employees", async function () {
      await employees.replenishEmployeeTokens();
      expect(await benefitsToken.balanceOf(account2.address)).to.equal(100000);
    });
  });

  /* describe("Payroll", function () {
    before("Should create new employee", async function () {
      await employees.addEmployee(
        "John Doe",
        1,
        111987,
        50000,
        account3.address
      );
      await employees.addEmployee(
        "Joao Doe",
        1,
        111987,
        50000,
        account3.address
      );
      await employees.addEmployee(
        "Jay Doe",
        1,
        111987,
        50000,
        account3.address
      );
      await employees.addEmployee(
        "Toby Doe",
        1,
        111987,
        50000,
        account3.address
      );
      await employees.releaseEmployee(4);
    });
    it("Gets employees", async function () {
      const emp = await employees.getActiveEmployees();
      console.log(emp);
    });
  }); */
});
