import { ethers, network } from "hardhat";

async function main() {
  console.log(`\nWithdrawing raised funds on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);

  const fixedSwap1 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardFixedSwap.address);
  const fixedSwap2 = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardmahaxFixedSwap.address);

  await fixedSwap1.withdrawFunds();
  await fixedSwap2.withdrawFunds();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
