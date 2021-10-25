// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import * as fs from "fs";

import hre, { ethers, network } from "hardhat";

const BigNumber = ethers.BigNumber;

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

async function deployToken(deploymentState: any, token: string, startTime: number, endTime: number) {
  const { provider } = ethers;
  const estimateGasPrice = await provider.getGasPrice();
  const gasPrice = estimateGasPrice.mul(2);
  const gasLimit = Math.floor(BigNumber.from(`6000000`).toNumber() * 1.5);

  console.log(`\nDeploying MockERC20...`);
  const MockERC20Factory = await ethers.getContractFactory("MockERC20");
  const mockERC20 = await MockERC20Factory.deploy(token, token, { gasPrice, gasLimit });
  deploymentState[token] = {
    abi: "IERC20",
    address: mockERC20.address,
  };
  console.log(`Verifying deployed MockERC20...`);
  await verifyContract(token, deploymentState, [token, token]);

  const hasWhitelisting = true;
  const isTokenSwapAtomic = false;
  const startDate = startTime;
  const endDate = endTime;
  const feeAmount = BigNumber.from("1");
  const individualMinimumAmount = BigNumber.from("0");
  const tradeValue = BigNumber.from("119090000000000000");
  const minimumRaise = BigNumber.from("3300000000000000000000");
  const tokensForSale = BigNumber.from("12500000000000000000000");
  const individualMaximumAmount = BigNumber.from("11800000000000000000");
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
    // feeAmount,
    hasWhitelisting,
    { gasPrice, gasLimit }
  );
  deploymentState[`${token}FixedSwap`] = {
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
    // feeAmount,
    hasWhitelisting,
  ]);

  console.log(`\nApproving MockERC20 tokens to fund the FixedSwap contract...`);
  await mockERC20.approve(fixedSwap.address, tokensForSale, { gasPrice, gasLimit });
  console.log(`\nFunding the FixedSwap contract...`);
  await fixedSwap.fund(tokensForSale, { gasPrice, gasLimit });

  console.log(`\nAdding to whitelist`);
  const whilelistAddresses = process.env.WHITELIST_ADDRESSES?.split(`,`) || [];
  // await fixedSwap.add([...whilelistAddresses], { gasPrice, gasLimit });
}

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');
  console.log(`\nBeginnning deployment script on network ${network.name.toUpperCase()}...\n`);

  const tokensAndStartTimes = [
    {
      token: `SCLP`,
      startTime: Math.floor(Date.now() / 1000) + 1 * 15 * 60,
      endTime: Math.floor(Date.now() / 1000) + 1 * 25 * 60,
    },
  ];
  const deploymentState: any = {};
  for (const token of tokensAndStartTimes) {
    await deployToken(deploymentState, token.token, token.startTime, token.endTime);
  }

  console.log(`\nWriting deployments to output file...`);
  const deploymentStateJSON = JSON.stringify(deploymentState, null, 2);
  fs.writeFileSync(`./output/${network.name}.json`, deploymentStateJSON);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
