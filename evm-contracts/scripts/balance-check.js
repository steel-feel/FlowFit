async function main() {
  const [deployer] = await ethers.getSigners();
  const result = await ethers.provider.getBalance(deployer);
  console.log("balance:", ethers.formatEther(result), "ETH");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
