const { ethers, hre, hardhatArguments } = require("hardhat");

async function main() {
  // Deploy Token Contract
  console.log("Deploying contracts...");
  const BenefitsToken = await ethers.getContractFactory("BenefitsToken");
  const token = await BenefitsToken.deploy();
  await token.deployed();
  console.log("BenefitsToken deployed at:", token.address);

  // Deploy Payroll Contract
  const Payroll = await ethers.getContractFactory("EmployeePayroll");
  const payroll = await Payroll.deploy();
  await payroll.deployed();
  console.log("Payroll deployed at:", payroll.address);

  // Deploy NFT Contract
  const PayrollioNFT = await ethers.getContractFactory("PayrollioNFT");
  const payrollioNFT = await PayrollioNFT.deploy();
  await payrollioNFT.deployed();
  console.log("NFTCotnract deployed at:", payrollioNFT.address);

  // Deploy DAO Contract
  const VotingDAO = await ethers.getContractFactory("VotingDAO");
  const votingDAO = await VotingDAO.deploy();
  await votingDAO.deployed();
  console.log("VotingDAO deployed at:", votingDAO.address);

  // Deploy Employee Contract
  const Employee = await ethers.getContractFactory("Employees");
  const employees = await Employee.deploy(
    token.address,
    payroll.address,
    payrollioNFT.address,
    votingDAO.address
  );
  await employees.deployed();
  console.log("Employees deployed at:", employees.address);
  console.log("ALL CONTRACTS DEPLOYED");

  // Update Contract Address

  console.log("Updating Contract Address on Benefits Token...");
  const tx1 = await token.updateEmployeeContract(employees.address);
  await tx1.wait();
  console.log("...Done!");
  console.log("Updating Contract Address on Payroll Token...");
  const tx2 = await payroll.updateEmployeeContractAddress(employees.address);
  await tx2.wait();
  const tx3 = await payroll.updateEmployeeContract(employees.address);
  await tx3.wait();
  console.log("...Done!");

  // Transfer Ownership Address

  console.log("Transfering Ownership of PayrollioNFT contract...");
  const tx4 = await payrollioNFT.transferOwnership(employees.address);
  await tx4.wait();
  console.log("...Done!");
  console.log("Transfering Ownership of VotingDao contract...");
  const tx11 = await votingDAO.transferOwnership(employees.address);
  await tx11.wait();
  console.log("...Done!");

  // Add Employees
  const wallet1 = "0x206b5bb730277Ac3ccF247466581220Be262644f";
  const wallet2 = "0x719cf7503838321980387002c16eFDC9BDB278Da";
  const wallet3 = "0x6e13Bae8db59F0A9e226C6a654E57121a10659A1";
  const wallet4 = "0x8848Faa9557E5985aCDc6fF1ef66FCC6f2C9eF36";
  const wallet5 = "0xD7d83a31940D4e2D7e9d14c6c0afA23978B2eB99";

  const tx5 = await employees.addEmployee(
    "John TheLazy",
    1,
    27111987,
    120000,
    wallet2
  );
  await tx5.wait();
  console.log("Employee 1 added.");

  const tx6 = await employees.addEmployee(
    "Joao TheNoob",
    2,
    10091983,
    70000,
    "0x6A9B5f0878b633eB867Ce8687Aad0f1809695c03"
  );
  await tx6.wait();
  console.log("Employee 2 added.");

  const tx7 = await employees.addEmployee(
    "Jay TheTyrant",
    3,
    25061994,
    150000,
    wallet5
  );
  await tx7.wait();
  console.log("Employee 3 added.");

  const tx8 = await employees.addEmployee(
    "Toby TheBoss",
    4,
    31101990,
    250000,
    "0xf7500C20F5063717f0933B0596C3B95042a5773E"
  );
  await tx8.wait();
  console.log("Employee 4 added.");

  const tx9 = await employees.addEmployee(
    "Lucas TheMissing",
    1,
    31101990,
    50000,
    wallet1
  );
  await tx9.wait();
  console.log("Employee 5 added.");

  // Add Thoby as Admin
  const tx10 = await employees.setAdmin(
    "0xf7500C20F5063717f0933B0596C3B95042a5773E",
    true
  );
  await tx10.wait();
  // Add Chainlink Registry as Admin
  const tx12 = await employees.setAdmin(
    "0x02777053d6764996e594c3E88AF1D58D5363a2e6",
    true
  );
  await tx12.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/*
BenefitsToken deployed at: 0x8f0f7b1DE7675342B4Fb7ed406d46e7472cD0090
VotingDAO deployed at: 0x8b8c0B098e6319017746FC2Ef9a7fD284c8e0680
NFTCotnract deployed at: 0x4CF89F8fe46b852646B55AD8B0AC5B60d2691F18
Payroll deployed at: 0x808Dda83D4E5e553a10df8CF2f6264F0813E3f1e
Employees deployed at: 0xAE68F1c111535855bFEF4E70Fa1d7499D3Fe01A2

*/
