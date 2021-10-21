import { ethers, network } from "hardhat";

async function main() {
  console.log(`\nBeginnning whitelisting script on network ${network.name.toUpperCase()}...\n`);

  const deployment = require(`../output/${network.name}.json`);
  const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.SCLPFixedSwap.address);

  console.log(`\nAdding to whitelist`);
  const whilelistAddresses = process.env.WHITELIST_ADDRESSES?.split(`,`) || [];
  await fixedSwap.add([...whilelistAddresses]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
