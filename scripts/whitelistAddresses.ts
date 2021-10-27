import { ethers, network } from "hardhat";

async function main() {
  console.log(`\nBeginnning Whitelisting script on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);
  const contractKeys: string[] = Object.keys(deployment);
  const whilelistAddresses = process.env.WHITELIST_ADDRESSES?.split(`,`) || [];

  for (const contractKey of contractKeys) {
    if (!contractKey.includes("FixedSwap")) continue;

    console.log(`\nAdding to whitelist for ${contractKey} Fixedswap...`);
    const fixedSwap = await ethers.getContractAt("FixedSwap", deployment[contractKey].address);
    await fixedSwap.add([...whilelistAddresses]);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
