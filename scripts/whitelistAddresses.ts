import { ethers, network } from "hardhat";

async function main() {
  console.log(`\nBeginnning whitelisting script on network ${network.name.toUpperCase()}...\n`);

  const deployment = require(`../output/${network.name}.json`);
  const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.SCLPFixedSwap.address);

  console.log(`\nAdding to whitelist`);
  const whilelistAddresses = process.env.WHITELIST_ADDRESSES?.split(`,`) || [];
  await fixedSwap.add([...whilelistAddresses, `0x3A244bDBF68bC15314C62827218b5f7F795cf394`]);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
