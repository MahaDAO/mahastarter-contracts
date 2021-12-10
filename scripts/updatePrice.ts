import { utils } from "ethers";
import { ethers, network } from "hardhat";

async function main() {
  console.log(`\nUpdating price script on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);
  const contractKeys: string[] = Object.keys(deployment);

  for (const contractKey of contractKeys) {
    if (!contractKey.includes("FixedSwap")) continue;

    console.log(`\nUpdating price for ${contractKey} Fixedswap...`);
    const fixedSwap = await ethers.getContractAt("FixedSwap", deployment[contractKey].address);
    await fixedSwap.updateTradePrice(utils.parseEther(`1`).mul(8259911894).div(1e10).div(1e3));
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
