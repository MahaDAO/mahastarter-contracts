// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  const BigNumber = ethers.BigNumber;

  const hasWhitelisting = true;
  const isTokenSwapAtomic = false;

  const startDate = Math.floor(Date.now() / 1000) + 5 * 60 * 60; // 5 hours from now.
  const endDate = startDate + 5 * 60 * 60; // 5 hours from start time.

  const feeAmount = BigNumber.from("1");
  const individualMinimumAmount = BigNumber.from("0");
  const tradeValue = BigNumber.from("909000000000000");
  const minimumRaise = BigNumber.from("33000000000000000000000");
  const tokensForSale = BigNumber.from("125000000000000000000000");
  const individualMaximumAmount = BigNumber.from("418000000000000000000");

  const FixedSwap = await ethers.getContractFactory("FixedSwap");
  const instance = await FixedSwap.deploy(
    "",
    tradeValue,
    tokensForSale,
    startDate,
    endDate,
    individualMinimumAmount,
    individualMaximumAmount,
    isTokenSwapAtomic,
    minimumRaise,
    feeAmount,
    hasWhitelisting
  );

  console.log("FixedSwap instance deployed at address: ", instance.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
