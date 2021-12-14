import { ethers, network } from "hardhat";
import fs from "fs/promises";
import path from "path";
import { isAddress } from "./utils";

async function main() {
  console.log(`\nBeginnning Whitelisting script on network ${network.name}...\n`);

  const deployment = require(`../output/${network.name}.json`);

  const mahaxRaw = await fs.readFile(path.resolve(__dirname, "../output/mahax.txt"));
  const publicRaw = await fs.readFile(path.resolve(__dirname, "../output/public.txt"));
  const mahaxt2 = await fs.readFile(path.resolve(__dirname, "../output/mahaxt2.txt"));
  const squareRaw = await fs.readFile(path.resolve(__dirname, "../output/squareRaw.txt"));


  const mahaxAddresses = mahaxRaw.toString().split("\n");
  const publicAddresses = publicRaw.toString().split("\n");
  const mahaxt2Addresses = mahaxt2.toString().split("\n");
  const squareRawAddresses = squareRaw.toString().split("\n");


  // console.log(`\nAdding to whitelist for SCLPscallopmahaxFixedSwap Fixedswap...`);
  // for (let i = 0; i < mahaxAddresses.length; i += 500) {
  //   const addressse = mahaxAddresses.slice(i, i + 500);
  //   const addressFinal = addressse.filter((a) => isAddress(a));
  //   console.log(i, addressFinal.length - 1, addressFinal[0], addressFinal[addressFinal.length - 1]);

  //   const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardmahaxFixedSwap.address);
  //   await fixedSwap.add(addressFinal);
  // }

  // console.log(`\nAdding to whitelist for SCLPscallopFixedSwap Fixedswap...`);
  // for (let i = 0; i < publicAddresses.length; i += 500) {
  //   const addressse = publicAddresses.slice(i, i + 500);
  //   const addressFinal = addressse.filter((a) => isAddress(a));
  //   console.log(i, addressFinal.length - 1, addressFinal[0], addressFinal[addressFinal.length - 1]);

  //   try {
  //     const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardFixedSwap.address);
  //     await fixedSwap.add(addressFinal);
  //   } catch (error) {
  //     console.log("whitelist failed for i = ", i);
  //   }
  // }

  // console.log(`\nAdding to whitelist for SCLPscallopFixedSwap Fixedswap...`);
  // for (let i = 0; i < mahaxt2Addresses.length; i += 500) {
  //   const addressse = mahaxt2Addresses.slice(i, i + 500);
  //   const addressFinal = addressse.filter((a) => isAddress(a));
  //   console.log(i, addressFinal.length - 1, addressFinal[0], addressFinal[addressFinal.length - 1]);

  //   try {
  //     const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardmahax2FixedSwap.address);
  //     await fixedSwap.add(addressFinal);
  //   } catch (error) {
  //     console.log("whitelist failed for i = ", i);
  //   }
  // }

  console.log(`\nAdding to whitelist for SCLPscallopFixedSwap Fixedswap...`);
  for (let i = 0; i < squareRawAddresses.length; i += 500) {
    const addressse = squareRawAddresses.slice(i, i + 500);
    const addressFinal = addressse.filter((a) => isAddress(a));
    console.log(i, addressFinal.length - 1, addressFinal[0], addressFinal[addressFinal.length - 1]);

    try {
      const fixedSwap = await ethers.getContractAt("FixedSwap", deployment.FORWARDforwardsquareupFixedSwap.address);
      await fixedSwap.add(addressFinal);
    } catch (error) {
      console.log("whitelist failed for i = ", i);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
