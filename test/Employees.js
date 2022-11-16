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
    account6,
    employees,
    benefitsToken,
    payroll,
    dao,
    payrollioNFT;

  before("Deploys Contracts", async function () {
    // Get Signers
    [deployer, account1, account2, account3, account4, account5, account6] =
      await ethers.getSigners();

    // Deploy DAO Contract

    const VotingDAO = await ethers.getContractFactory("VotingDAO");
    dao = await VotingDAO.deploy();
    await dao.deployed();

    // Deploy Token Contract
    const BenefitsToken = await ethers.getContractFactory("BenefitsToken");
    benefitsToken = await BenefitsToken.deploy();
    await benefitsToken.deployed();

    // Deploy NFT Contract
    const PayrollioNFT = await ethers.getContractFactory("PayrollioNFT");
    payrollioNFT = await PayrollioNFT.deploy();
    await payrollioNFT.deployed();

    // Deploy Payroll Contract
    const Payroll = await ethers.getContractFactory("EmployeePayroll");
    payroll = await Payroll.deploy();
    await payroll.deployed();

    // Deploy Employee Contract
    const Employee = await ethers.getContractFactory("Employees");
    employees = await Employee.deploy(
      benefitsToken.address,
      payroll.address,
      payrollioNFT.address,
      dao.address
    );
    await employees.deployed();
    console.log("ALL CONTRACTS DEPLOYED");

    // Update Contract Address
    await benefitsToken.updateEmployeeContract(employees.address);
    await payroll.updateEmployeeContractAddress(employees.address);
    await payroll.updateEmployeeContract(employees.address);
    await payrollioNFT.transferOwnership(employees.address);
    await dao.transferOwnership(employees.address);
  });

  describe("Deployed with correct owner", function () {
    it("Should have the right owner", async function () {
      const employeesOwner = await employees.owner();
      expect(employeesOwner).to.equal(deployer.address);
      const payrollioNFTOwner = await payrollioNFT.owner();
      expect(payrollioNFTOwner).to.equal(employees.address);
      const daoOwner = await dao.owner();
      expect(daoOwner).to.equal(employees.address);
    });
  });

  describe("Employee Management", function () {
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
      expect(balance).to.equal(ethers.utils.parseEther("100000"));
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
      it("Should liquidate Employee", async function () {
        expect(await payroll.balanceOf(account3.address)).to.equal(
          ethers.utils.parseEther("4080")
        );
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
        await employees.assignRank(0, 2, 50000);
        const employee1 = await employees.employees(0);
        expect(employee1.rank).to.equal(2);
        expect(employee1.salary).to.equal(50000);
      });
      it("Revert if ID doesnt exist", async function () {
        await expect(employees.assignRank(7, 1, 100000)).to.be.revertedWith(
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
        4,
        111987,
        50000,
        account4.address
      );
      await employees.addEmployee(
        "Toby Doe",
        4,
        111987,
        50000,
        account5.address
      );
    });

    it("John spends tokens on break", async function () {
      await benefitsToken.connect(account2).buyExtraBreak();
      expect(await benefitsToken.balanceOf(account2.address)).to.equal(
        ethers.utils.parseEther("90000")
      );
    });
    it("John spends tokens on lunch", async function () {
      await benefitsToken.connect(account2).buyLunch();
      expect(await benefitsToken.balanceOf(account2.address)).to.equal(
        ethers.utils.parseEther("80000")
      );
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
    it("Replenishes tokens to all active employees on day 30", async function () {
      for (let i = 0; i < 31; i++) {
        await employees.replenishEmployeeTokens();
      }

      expect(await benefitsToken.balanceOf(account2.address)).to.equal(
        ethers.utils.parseEther("100000")
      );
    });
  });

  describe("Payroll", function () {
    it("Reduces a day everytime its called", async function () {
      await employees.payActiveEmployees();

      employeeArray = await employees.getActiveEmployees();
      expect(await employeeArray[3].daysToNextPay).to.equal(29);
    });
    it("Pays employee on day 30", async function () {
      for (let i = 0; i < 32; i++) {
        await employees.payActiveEmployees();
      }
      expect(await payroll.balanceOf(account4.address)).to.equal(
        ethers.utils.parseEther("4166")
      );
    });
  });

  describe("NFTs", function () {
    it("Mints NFTs to newly added employee", async function () {
      expect(await payrollioNFT.balanceOf(account2.address, 1)).to.equal(1);
    });
    it("Mints NFT when employee is promoted", async function () {
      await employees.assignRank(2, 4, "150000");
      expect(await payrollioNFT.balanceOf(account3.address, 4)).to.equal(1);
    });
    it("Burns NFTs when employee is released", async function () {
      await payrollioNFT
        .connect(account3)
        .setApprovalForAll(employees.address, true);
      await employees.releaseEmployee(4);
      expect(await payrollioNFT.balanceOf(account3.address, 3)).to.equal(0);
    });
    it("Should return array of NFTs by account", async function () {
      await employees.addEmployee(
        "Jesus Christ",
        1,
        27111987,
        50000,
        account6.address
      );
    });
    it("Should mint an ex-employee NFT", async function () {
      await employees.releaseEmployee(5);
      expect(
        typeof (await payrollioNFT.getAccountsNFTs(account6.address))
      ).to.equal("object");
    });
  });

  describe("DAO", function () {
    it("Should revert if nominees are not active", async function () {
      await expect(
        employees.initiateEmployeeOfTheMonthProposal(
          account2.address,
          account3.address,
          account1.address
        )
      ).to.be.revertedWith("Nominee 3 is not active");
    });
    it("Should revert if nominees are duplicated", async function () {
      await expect(
        employees.initiateEmployeeOfTheMonthProposal(
          account2.address,
          account3.address,
          account3.address
        )
      ).to.be.revertedWith("Duplicate Candidates");
    });
    it("Should create a new proposal", async function () {
      await employees.initiateEmployeeOfTheMonthProposal(
        account2.address,
        account3.address,
        account4.address
      );
      const proposal = await dao.votingRegistry(0);
      expect(proposal.isActive).to.equal(true);
    });
    it("Should revert if there is an active proposal already", async function () {
      await expect(
        employees.initiateEmployeeOfTheMonthProposal(
          account2.address,
          account3.address,
          account3.address
        )
      ).to.be.revertedWith("A voting section is already live!");
    });
    it("Revert if Voter is not an active employee", async function () {
      await expect(
        employees.connect(account1).voteForEmployeeOfTheMonth(1)
      ).to.be.revertedWith("Voter is not an active employee");
    });
    it("Revert if Voter already voted", async function () {
      await employees.connect(account3).voteForEmployeeOfTheMonth(1);
      await expect(
        employees.connect(account3).voteForEmployeeOfTheMonth(1)
      ).to.be.revertedWith("You can only vote once.");
    });
    it("Successfull Vote", async function () {
      await employees.connect(account4).voteForEmployeeOfTheMonth(1);
      expect(await dao.hasVoted(0, account4.address)).to.equal(true);
    });
    it("End Voting", async function () {
      await employees.endVotingOfEmployeeOfTheMonth();
      const proposal = await dao.votingRegistry(0);
      expect(proposal.isActive).to.equal(false);
      expect(proposal.employeeOfTheMonth).to.equal(account3.address);
    });
    it("Fetches previous EOM", async function () {
      const eom = await employees.getPreviousEmployeeOfTheMonth();
      expect(typeof eom).to.equal("object");
    });
    it("Checks if an address has voted", async function () {
      expect(await employees.hasVoted(0, account4.address)).to.equal(true);
    });
    it("Returns the 3 elegible cadidates as Employees", async function () {
      const elegibleCandidates =
        await employees.getElegibleCandidatesForVotingByMonth(0);
    });
  });
});
