/* eslint-disable node/no-missing-import */
import { ethers, network } from "hardhat";

import { isAddress } from "./utils";

async function main() {
  console.log(`\nBeginnning Whitelisting script on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);
  const addr = "0xd3D6a2bEEa31085DA6bE2a874618D466693399f8";
  console.log(`Is valid address: `, isAddress(addr));
  const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.SCLPscallopFixedSwap.address);
  console.log(`Is whitelisted: `, await fixedSwap.isWhitelisted(addr));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
