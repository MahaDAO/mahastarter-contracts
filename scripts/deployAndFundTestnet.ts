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

async function deployToken(
  deploymentState: any,
  id: string,
  token: string,
  startTime: number,
  endTime: number,
  obj: any
) {
  const { provider } = ethers;

  const estimateGasPrice = await provider.getGasPrice();
  const gasPrice = estimateGasPrice.mul(2);
  const gasLimit = Math.floor(BigNumber.from(`6000000`).toNumber() * 1.5);

  console.log(`\nDeploying MockERC20...`);
  let mockERC20;
  if (!deploymentState[token]) {
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockERC20 = await MockERC20Factory.deploy(token, token, { gasPrice, gasLimit });
    deploymentState[token] = {
      abi: "IERC20",
      address: mockERC20.address,
    };
    console.log(`Verifying deployed MockERC20...`);
    await verifyContract(token, deploymentState, [token, token]);
  } else {
    mockERC20 = await ethers.getContractAt("MockERC20", deploymentState[token].address);
  }

  const hasWhitelisting = true;
  const isTokenSwapAtomic = false;
  const startDate = startTime;
  const endDate = endTime;
  const individualMinimumAmount = BigNumber.from("0");
  const tradeValue = BigNumber.from("119090000000000000");
  const minimumRaise = BigNumber.from("3300000000000000000");
  const tokensForSale = BigNumber.from("12500000000000000000");
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
    hasWhitelisting,
    { gasPrice, gasLimit }
  );
  await fixedSwap.deployed();
  deploymentState[`${token}${id}FixedSwap`] = {
    abi: "FixedSwap",
    address: fixedSwap.address,
  };

  console.log(`Verifying FixedSwap for the deployed MockERC20...`);
  await verifyContract(`${token}${id}FixedSwap`, deploymentState, [
    mockERC20.address,
    obj.tradeValue,
    obj.tokensForSale,
    startDate,
    endDate,
    obj.individualMinimumAmount,
    obj.individualMaximumAmount,
    isTokenSwapAtomic,
    obj.minimumRaise,
    hasWhitelisting,
  ]);

  console.log(`\nApproving MockERC20 tokens to fund the FixedSwap contract...`);
  await mockERC20.approve(fixedSwap.address, obj.tokensForSale, { gasPrice, gasLimit });
  console.log(`\nFunding the FixedSwap contract...`);
  await fixedSwap.fund(obj.tokensForSale, { gasPrice, gasLimit });
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
      id: `scallop`,
      startTime: Math.floor(Date.now() / 1000) + 1 * 20 * 60,
      endTime: Math.floor(Date.now() / 1000) + 1 * (20 + 15) * 60,
      tradeValue: BigNumber.from("1000000000000000000").mul(490).mul(100).div(15),
      minimumRaise: BigNumber.from("5000000000000000000").mul(100).div(15),
      tokensForSale: BigNumber.from("125000000000000000000000").mul(100).div(15),
      individualMinimumAmount: BigNumber.from("0").mul(100).div(15),
      individualMaximumAmount: BigNumber.from("500000000000000000000").mul(100).div(15),
    },
    {
      token: `SCLP`,
      id: `scallopmahax`,
      startTime: Math.floor(Date.now() / 1000) + 1 * 20 * 60,
      endTime: Math.floor(Date.now() / 1000) + 1 * (20 + 15) * 60,
      tradeValue: BigNumber.from("1000000000000000000").mul(490).mul(100).div(15),
      minimumRaise: BigNumber.from("5000000000000000000").mul(100).div(15),
      tokensForSale: BigNumber.from("125000000000000000000000").mul(100).div(15),
      individualMinimumAmount: BigNumber.from("0").mul(100).div(15),
      individualMaximumAmount: BigNumber.from("1000000000000000000000").mul(100).div(15),
    }
  ];

  const deploymentState: any = {};
  for (const token of tokensAndStartTimes) {
    await deployToken(deploymentState, token.id, token.token, token.startTime, token.endTime, token);
  }

  console.log(`\nWriting deployments to output file...`);
  const deploymentStateJSON = JSON.stringify(deploymentState, null, 2);
  fs.writeFileSync(`./output/${network.name}.json`, deploymentStateJSON);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
