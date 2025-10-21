const hre = require("hardhat");

async function main() {
  console.log("Deploying CovertArbitrageDeck contract...");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  const CovertArbitrageDeck = await hre.ethers.getContractFactory("CovertArbitrageDeck");
  const contract = await CovertArbitrageDeck.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("CovertArbitrageDeck deployed to:", contractAddress);

  // Wait for a few block confirmations
  console.log("Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);

  console.log("\n=== Deployment Summary ===");
  console.log("Contract Address:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", deployer.address);

  console.log("\n=== Next Steps ===");
  console.log("1. Update frontend/.env with:");
  console.log(`   VITE_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("\n2. Verify contract on Etherscan (optional):");
  console.log(`   npx hardhat verify --network sepolia ${contractAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
