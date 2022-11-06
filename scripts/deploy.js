const { ethers, hre } = require("hardhat");

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
  setTimeout(async () => {
    console.log("Updating Contract Address...");
    await token.updateEmployeeContract(employees.address);
    await payroll.updateEmployeeContractAddress(employees.address);
    await payroll.updateEmployeeContract(employees.address);
  }, 10000);

  // Transfer Ownership Address
  setTimeout(async () => {
    console.log("Transfering Ownership...");
    await payrollioNFT.transferOwnership(employees.address);
  }, 15000);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

/*
BenefitsToken deployed at: 0xcE2c34e8028fD6239418Da3c9a9f66D13a66c92E
NFTCotnract deployed at: 0x0BD7F7a711757939F24dD1F14c8d205C7B69D895
Payroll deployed at: 0xFe69d261394744545faD3bDe5010107153b4a326
Employees deployed at: 0x967a1f0D4E755E51CdB4D09aF67b1715CC208C8B

Wallet1: 0x206b5bb730277Ac3ccF247466581220Be262644f
Wallet2: 0x719cf7503838321980387002c16eFDC9BDB278Da
Wallet3: 0x6e13Bae8db59F0A9e226C6a654E57121a10659A1
Wallet4: 0x8848Faa9557E5985aCDc6fF1ef66FCC6f2C9eF36
*/
