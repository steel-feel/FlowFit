async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with the account:", deployer.address);

  const HelloFlow = await ethers.getContractFactory("HelloFlow");
  const contract = await HelloFlow.deploy("Hello from Flow EVM!");

  console.log("Contract deployed to:", contract);
  console.log("Contract deployed to:", await contract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
