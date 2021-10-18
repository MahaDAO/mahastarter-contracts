// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.

import * as fs from "fs";

import hre, { ethers, network } from "hardhat";

async function verifyContract(name: string, deploymentState: any, constructorArguments: any[] = []) {
  try {
    await hre.run("verify:verify", {
      address: deploymentState[name].address,
      constructorArguments,
    });
  } catch (error: any) {
    console.error(`- Error verifying ${name}: ${error.name}`);
  }
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  console.log(`\nBeginnning deployment script on network ${network.name.toUpperCase()}...\n`);

  const BigNumber = ethers.BigNumber;
  const deploymentState: any = {};

  console.log(`Deploying MockERC20...`);
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20Factory.deploy("ScallopX", "SCLP");
  deploymentState.ScallopX = {
    abi: "IERC20",
    address: mockERC20.address,
  };
  console.log(`Verifying deployed MockERC20...`);
  await verifyContract("ScallopX", deploymentState, ["ScallopX", "SCLP"]);

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
  console.log(`\nDeploying FixedSwap for the deployed MockERC20...`);
  const FixedSwapFactory = await ethers.getContractFactory("FixedSwap");
  const fixedSwap = await FixedSwapFactory.deploy(
    mockERC20.address,
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
  deploymentState.SCLPFixedSwap = {
    abi: "FixedSwap",
    address: fixedSwap.address,
  };
  console.log(`Verifying FixedSwap for the deployed MockERC20...`);
  await verifyContract("SCLPFixedSwap", deploymentState, [
    mockERC20.address,
    tradeValue,
    tokensForSale,
    startDate,
    endDate,
    individualMinimumAmount,
    individualMaximumAmount,
    isTokenSwapAtomic,
    minimumRaise,
    feeAmount,
    hasWhitelisting,
  ]);

  console.log(`\nWriting deployments to output file...`);
  const deploymentStateJSON = JSON.stringify(deploymentState, null, 2);
  fs.writeFileSync(`./output/${network.name}.json`, deploymentStateJSON);

  console.log(`\nApproving MockERC20 tokens to fund the FixedSwap contract...`);
  await mockERC20.approve(fixedSwap.address, tokensForSale);
  console.log(`\nFunding the FixedSwap contract...`);
  await fixedSwap.fund(tokensForSale);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
