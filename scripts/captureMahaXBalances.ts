import { ethers, network } from "hardhat";
import fs from "fs/promises";
import path from "path";
import { isAddress } from "./utils";
import { BigNumber } from "@ethersproject/bignumber";

async function main() {
  console.log(`\nBeginnning Whitelisting script on network ${network.name}...\n`);

  const mahaxContract = "0x4be73D0fB890247F29b06bF4eD0225D18a61c98b";

  const src = path.resolve(__dirname, "../output/addresses.txt");
  const dest = path.resolve(__dirname, "../output/mahax-balances.csv");
  const e18 = BigNumber.from(10).pow(18);

  const addresses = await fs.readFile(src);

  const addressesFinal = addresses.toString().split("\n");

  const fixedSwap = await ethers.getContractAt("IERC20", mahaxContract);

  console.log(`\nAdding to whitelist for SCLPscallopmahaxFixedSwap Fixedswap...`);
  for (let i = 0; i < addressesFinal.length; i += 1) {
    if (!isAddress(addressesFinal[i])) continue;
    // const addressse = addressesFinal.slice(i, i + 500);
    // const addressFinal = addressse.filter((a) => isAddress(a));
    // console.log(i, addressFinal.length - 1, addressFinal[0], addressFinal[addressFinal.length - 1]);

    const balance = await fixedSwap.balanceOf(addressesFinal[i]);

    const line = `${addressesFinal[i]},${balance.div(e18).toString()}\n`;
    fs.appendFile(dest, line);
    console.log(line);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
