const hre = require("hardhat");

async function main() {
  const Employee = await hre.ethers.getContractFactory("Employees");
  const employees = await Employee.deploy();

  await employees.deployed();

  console.log("Employees deployed at:", employees.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
