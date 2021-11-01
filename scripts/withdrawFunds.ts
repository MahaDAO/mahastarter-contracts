import { ethers, network } from "hardhat";
import fs from "fs/promises";
import path from "path";
import { isAddress } from "./utils";

async function main() {
  console.log(`\Withdrawing raised funds on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);

  const fixedSwap1 = await ethers.getContractAt("FixedSwap", deployment.SCLPscallopFixedSwap.address);
  const fixedSwap2 = await ethers.getContractAt("FixedSwap", deployment.SCLPscallopmahaxFixedSwap.address);
  console.log(await fixedSwap1.pause());
  console.log(await fixedSwap2.pause());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
