/* eslint-disable node/no-missing-import */
import { ethers, network } from "hardhat";

import { isAddress } from "./utils";

async function main() {
  console.log(`\nBeginnning Whitelisting script on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);
  const addr = "0x8AcE04A9aB843cBe14925e1eB80627EC548B1761";
  console.log(`Is valid address: `, addr, isAddress(addr));
  const fixedSwap1 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardFixedSwap.address);
  console.log(`Is whitelisted for public: `, await fixedSwap1.isWhitelisted(addr));

  const fixedSwap2 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardmahaxFixedSwap.address);
  console.log(`Is whitelisted for mahax t1: `, await fixedSwap2.isWhitelisted(addr));
  const fixedSwap3 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardmahax2FixedSwap.address);
  console.log(`Is whitelisted for mahax t2: `, await fixedSwap3.isWhitelisted(addr));
  const fixedSwap4 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardsquareupFixedSwap.address);
  console.log(`Is whitelisted for square up: `, await fixedSwap4.isWhitelisted(addr));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
