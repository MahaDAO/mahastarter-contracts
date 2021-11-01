import { ethers, network } from "hardhat";
import fs from "fs/promises";
import path from "path";
import { isAddress } from "./utils";

async function main() {
  console.log(`\nBeginnning Whitelisting script on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);
  const addr = "0xd3D6a2bEEa31085DA6bE2a874618D466693399f8";
  console.log(isAddress(addr));
  const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.SCLPscallopFixedSwap.address);
  console.log(await fixedSwap.isWhitelisted(addr));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
