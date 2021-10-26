import { ethers, network } from "hardhat";

async function main() {
  const { provider, BigNumber } = ethers;
  const estimateGasPrice = await provider.getGasPrice();
  const gasPrice = estimateGasPrice.mul(2);
  const gasLimit = Math.floor(BigNumber.from(`6000000`).toNumber() * 1.5);

  console.log(`\nBeginnning SafePull script on network ${network.name.toUpperCase()}...\n`);

  const deployment = require(`../output/${network.name}.json`);
  const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.SCLPscallopFixedSwap.address);

  console.log(`\nPausing...`);
  const tx = await fixedSwap.pause({ gasPrice, gasLimit });
  console.log(`Tx hash`, tx.hash);
  await tx.wait();

  console.log(`\nSafe pulling...`);
  const tx2 = await fixedSwap.safePull({ gasPrice, gasLimit });
  console.log(`Tx hash`, tx2.hash);
  await tx2.wait();

  console.log(`Done`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
