const dotenv = require("dotenv");
dotenv.config();
const { ethers } = require("hardhat");
const provider = new ethers.providers.JsonRpcProvider(
  "https://rpc.ankr.com/polygon_mumbai"
);
const employeeABI =
  require("../artifacts/contracts/Employees.sol/Employees.json").abi;
const address = "0xF9D2726FfAd67f8000b816aa0DCD4ae17B931979";
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const employeeContract = new ethers.Contract(address, employeeABI, signer);

const main = async () => {
  const wallet1 = new ethers.Wallet.createRandom();
  const wallet2 = new ethers.Wallet.createRandom();
  const wallet3 = new ethers.Wallet.createRandom();
  const wallet4 = new ethers.Wallet.createRandom();
  const wallet5 = new ethers.Wallet.createRandom();

  const tx1 = await employeeContract.addEmployee(
    "John Doe",
    1,
    27111987,
    50000,
    wallet1.address
  );
  await tx1.wait();
  console.log("Employee 1 added.");

  const tx2 = await employeeContract.addEmployee(
    "Joao Doe",
    2,
    10091983,
    50000,
    wallet2.address
  );
  await tx2.wait();
  console.log("Employee 2 added.");

  const tx3 = await employeeContract.addEmployee(
    "Jay Doe",
    3,
    25061994,
    50000,
    wallet3.address
  );
  await tx3.wait();
  console.log("Employee 3 added.");

  const tx4 = await employeeContract.addEmployee(
    "Toby Doe",
    4,
    31101990,
    50000,
    wallet4.address
  );
  await tx4.wait();
  console.log("Employee 4 added.");

  const tx5 = await employeeContract.addEmployee(
    "Lucas Doe",
    1,
    31101990,
    50000,
    wallet5.address
  );
  await tx5.wait();
  console.log("Employee 5 added.");
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
