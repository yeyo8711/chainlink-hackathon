const hre = require("hardhat");
const { ethers, hre } = require("hardhat");

async function main() {
  const wallet1 = new ethers.Wallet.createRandom();
  const wallet2 = new ethers.Wallet.createRandom();
  const wallet3 = new ethers.Wallet.createRandom();
  const wallet4 = new ethers.Wallet.createRandom();
  const wallet5 = new ethers.Wallet.createRandom();

  // Deploy Token Contract
  const EmployeeToken = await ethers.getContractFactory("EmployeeToken");
  const token = await EmployeeToken.deploy();
  await token.deployed();
  console.log("EmployeeToken deployed at:", token.address);

  // Deploy Payroll Contract
  const Payroll = await ethers.getContractFactory("EmployeePayroll");
  const payroll = await Payroll.deploy();
  await payroll.deployed();
  console.log("Payroll deployed at:", payroll.address);

  // Deploy Employee Contract
  const Employee = await ethers.getContractFactory("Employees");
  const employees = await Employee.deploy(token.address, payroll.address);
  await employees.deployed();
  console.log("Employees deployed at:", employees.address);

  // Update Contract Address
  setTimeout(async () => {
    await token.updateEmployeeContract(employees.address);
    await payroll.updateEmployeeContractAddress(employees.address);
    await payroll.updateEmployeeContract(employees.address);
  }, 10000);

  setTimeout(async () => {
    await employees.addEmployee(
      "John Doe",
      1,
      27111987,
      50000,
      wallet1.address
    );
    await employees.addEmployee(
      "Joao Doe",
      1,
      10091983,
      50000,
      wallet2.address
    );
    await employees.addEmployee("Jay Doe", 1, 25061994, 50000, wallet3.address);
    await employees.addEmployee(
      "Toby Doe",
      1,
      31101990,
      50000,
      wallet4.address
    );
    await employees.addEmployee(
      "Lucas Doe",
      1,
      31101990,
      50000,
      wallet5.address
    );
  }, 20000);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
