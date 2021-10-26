import { ethers, network } from "hardhat";

async function main() {
  console.log(`\nBeginnning whitelisting script on network ${network.name.toUpperCase()}...\n`);

  const deployment = require(`../output/${network.name}.json`);
  // const fixedSwap1 = await ethers.getContractAt("FixedSwap", deployment.SCLPscallopmahaxFixedSwap.address);
  const fixedSwap2 = await ethers.getContractAt("FixedSwap", deployment.SCLPscallopFixedSwap.address);

  console.log(`\nAdding to whitelist`);
  const whilelistAddresses = process.env.WHITELIST_ADDRESSES?.split(`,`) || [];
  // await fixedSwap1.add([...whilelistAddresses]);
  await fixedSwap2.add([...whilelistAddresses]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
