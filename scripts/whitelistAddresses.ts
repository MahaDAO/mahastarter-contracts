import { ethers, network } from "hardhat";
import fs from "fs/promises";
import path from "path";
import { isAddress } from "./utils";

async function main() {
  console.log(`\nBeginnning Whitelisting script on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);

  const mahaxRaw = await fs.readFile(path.resolve(__dirname, "../output/mahax.txt"));
  const publicRaw = await fs.readFile(path.resolve(__dirname, "../output/public.txt"));

  const mahaxAddresses = mahaxRaw.toString().split("\n");
  const publicAddresses = publicRaw.toString().split("\n");

  console.log(`\nAdding to whitelist for SCLPscallopmahaxFixedSwap Fixedswap...`);
  for (let i = 0; i < mahaxAddresses.length; i += 500) {
    const addressse = mahaxAddresses.slice(i, i + 500);
    const addressFinal = addressse.filter((a) => isAddress(a));
    console.log(i, addressFinal.length - 1, addressFinal[0], addressFinal[addressFinal.length - 1]);

    const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.SCLPscallopmahaxFixedSwap.address);
    await fixedSwap.add(["0xa99037f7AADc8acc0F2b259Eb947f04F4c51690f"]);
  }

  // console.log(`\nAdding to whitelist for SCLPscallopFixedSwap Fixedswap...`);
  // for (let i = 0; i < publicAddresses.length; i += 500) {
  //   const addressse = publicAddresses.slice(i, i + 500);
  //   const addressFinal = addressse.filter((a) => isAddress(a));
  //   console.log(i, addressFinal.length - 1, addressFinal[0], addressFinal[addressFinal.length - 1]);

  //   try {
  //     const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.SCLPscallopFixedSwap.address);
  //     await fixedSwap.add(addressFinal);
  //   } catch (error) {
  //     console.log("whitelist failed for i = ", i);
  //   }
  // }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
