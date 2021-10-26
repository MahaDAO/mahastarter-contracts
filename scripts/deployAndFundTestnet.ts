import { utils } from "ethers";
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

  console.log(`\nDeploying FixedSwap for the deployed MockERC20...`);
  const FixedSwapFactory = await ethers.getContractFactory("FixedSwap");
  const fixedSwap = await FixedSwapFactory.deploy(
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
  console.log(`\nBeginnning deployment script on network ${network.name.toUpperCase()}...\n`);

  const tokensAndStartTimes = [
    {
      token: `SCLP`,
      id: `scallop`,
      startTime: Math.floor(Date.now() / 1000) + 1 * 5 * 60,
      endTime: Math.floor(Date.now() / 1000) + 1 * (5 + 20) * 60,
      tradeValue: utils.parseEther(`1`).mul(7653061224).div(1e10).div(1e3),
      minimumRaise: utils.parseEther(`1`).mul(200000),
      tokensForSale: utils.parseEther(`1`).mul(400000),
      individualMinimumAmount: BigNumber.from("0"),
      individualMaximumAmount: BigNumber.from("500000000000000000000").mul(1000).div(375),
    },
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
