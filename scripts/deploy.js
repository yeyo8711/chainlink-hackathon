const { ethers, hre, hardhatArguments } = require("hardhat");

async function main() {
  // Deploy Token Contract
  console.log("Deploying contracts...");

  const BenefitsToken = await ethers.getContractFactory("BenefitsToken");
  const token = await BenefitsToken.deploy();
  await token.deployed();
  console.log("BenefitsToken deployed at:", token.address);

  // Deploy NFT Contract
  const PayrollioNFT = await ethers.getContractFactory("PayrollioNFT");
  const payrollioNFT = await PayrollioNFT.deploy();
  await payrollioNFT.deployed();
  console.log("NFTCotnract deployed at:", payrollioNFT.address);

  // Deploy Payroll Contract
  const Payroll = await ethers.getContractFactory("EmployeePayroll");
  const payroll = await Payroll.deploy();
  await payroll.deployed();
  console.log("Payroll deployed at:", payroll.address);

  // Deploy Employee Contract
  const Employee = await ethers.getContractFactory("Employees");
  const employees = await Employee.deploy(
    token.address,
    payroll.address,
    payrollioNFT.address
  );
  await employees.deployed();
  console.log("Employees deployed at:", employees.address);
  console.log("ALL CONTRACTS DEPLOYED");

  // Update Contract Address

  console.log("Updating Contract Address...");
  const tx1 = await token.updateEmployeeContract(employees.address);
  await tx1.wait();
  const tx2 = await payroll.updateEmployeeContractAddress(employees.address);
  await tx2.wait();
  const tx3 = await payroll.updateEmployeeContract(employees.address);
  await tx3.wait();
  console.log("...Done!");

  // Transfer Ownership Address

  console.log("Transfering Ownership...");
  const tx4 = await payrollioNFT.transferOwnership(employees.address);
  await tx4.wait();
  console.log("...Done!");

  // Add Employees
  const wallet1 = new ethers.Wallet.createRandom();
  const wallet2 = new ethers.Wallet.createRandom();
  const wallet3 = new ethers.Wallet.createRandom();
  const wallet4 = new ethers.Wallet.createRandom();
  const wallet5 = new ethers.Wallet.createRandom();

  const tx5 = await employeeContract.addEmployee(
    "John Doe",
    1,
    27111987,
    50000,
    wallet1.address
  );
  await tx5.wait();
  console.log("Employee 1 added.");

  const tx6 = await employeeContract.addEmployee(
    "Joao Doe",
    2,
    10091983,
    50000,
    wallet2.address
  );
  await tx6.wait();
  console.log("Employee 2 added.");

  const tx7 = await employeeContract.addEmployee(
    "Jay Doe",
    3,
    25061994,
    50000,
    wallet3.address
  );
  await tx7.wait();
  console.log("Employee 3 added.");

  const tx8 = await employeeContract.addEmployee(
    "Toby Doe",
    4,
    31101990,
    50000,
    wallet4.address
  );
  await tx8.wait();
  console.log("Employee 4 added.");

  const tx9 = await employeeContract.addEmployee(
    "Lucas Doe",
    1,
    31101990,
    50000,
    wallet5.address
  );
  await tx9.wait();
  console.log("Employee 5 added.");

  // Add Thoby as Admin
  const tx10 = await employeeContract.setAdmin(
    "0xf7500C20F5063717f0933B0596C3B95042a5773E",
    true
  );
  await tx10.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/*
BenefitsToken deployed at: 0xf35F4194Fb0d5F88CEF4777f8D43Df8275AC4645
NFTCotnract deployed at: 0x66353b36b05b4e9c684dAc319cB032514934A0D5
Payroll deployed at: 0xFc89047B2A8ABe191957093a0c3Efc6eB8B2d266
Employees deployed at: 0xF9D2726FfAd67f8000b816aa0DCD4ae17B931979

Wallet1: 0x206b5bb730277Ac3ccF247466581220Be262644f
Wallet2: 0x719cf7503838321980387002c16eFDC9BDB278Da
Wallet3: 0x6e13Bae8db59F0A9e226C6a654E57121a10659A1
Wallet4: 0x8848Faa9557E5985aCDc6fF1ef66FCC6f2C9eF36
*/
