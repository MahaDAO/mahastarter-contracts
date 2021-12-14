import { ethers, network } from "hardhat";

async function main() {
  console.log(`\nSafepulling funds on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);

  const fixedSwap1 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardmahaxFixedSwap.address);
  const fixedSwap2 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardFixedSwap.address);
  const fixedSwap3 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardmahax2FixedSwap.address);
  const fixedSwap4 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardsquareupFixedSwap.address);

  await fixedSwap1.pause();
  await fixedSwap2.pause();
  await fixedSwap3.pause();
  await fixedSwap4.pause();

  await fixedSwap1.safePull();
  await fixedSwap2.safePull();
  await fixedSwap3.safePull();
  await fixedSwap4.safePull();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
