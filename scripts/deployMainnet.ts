/* eslint-disable node/no-missing-import */
import * as fs from "fs";

import { ethers, network } from "hardhat";
import { Overrides, utils, BigNumber } from "ethers";

// import { verifyContract } from "./utils";
import { DeploymentStateType, FixedSwapDeploymentType } from "./types";

const { provider } = ethers;

async function deployFixedSwap(
  key: string,
  tokenAddress: string,
  deploymentState: DeploymentStateType,
  constructorArgs: FixedSwapDeploymentType,
  overrides: Overrides & { from?: string | Promise<string> }
) {
  const FixedSwapFactory = await ethers.getContractFactory("FixedSwap");

  console.log(`\nDeploying FixedSwap with ERC20:${tokenAddress}...`);
  const fixedSwap = await FixedSwapFactory.deploy(
    tokenAddress, // TODO hardcode/replace in mainnet deployment
    constructorArgs.tradeValue,
    constructorArgs.tokensForSale,
    constructorArgs.startDate,
    constructorArgs.endDate,
    constructorArgs.individualMinimumAmount,
    constructorArgs.individualMaximumAmount,
    constructorArgs.isTokenSwapAtomic,
    constructorArgs.minimumRaise,
    18,
    constructorArgs.hasWhitelisting,
    overrides
  );

  await fixedSwap.deployed();
  console.log(`Deployed FixedSwap at ${fixedSwap.address}...`);

  deploymentState[key] = {
    abi: "FixedSwap",
    address: fixedSwap.address,
  };

  // await verifyContract(fixedSwap.address, Object.values(constructorArgs));
}

async function fundFixedSwap(
  key: string,
  tokenAddress: string,
  deploymentState: DeploymentStateType,
  constructorArgs: FixedSwapDeploymentType,
  overrides: Overrides & { from?: string | Promise<string> }
) {
  const fixedSwap = await ethers.getContractAt("FixedSwap", deploymentState[key].address);
  const erc20 = await ethers.getContractAt("MockERC20", tokenAddress);

  console.log(`\nApproving ERC20:${erc20.address} to fund FixedSwap:${fixedSwap.address}...`);
  await erc20.approve(fixedSwap.address, constructorArgs.tokensForSale, overrides);

  console.log(`Funding ERC20:${erc20.address} to fund FixedSwap:${fixedSwap.address}...`);
  await fixedSwap.fund(constructorArgs.tokensForSale, overrides);
}

async function main() {
  const deploymentState: DeploymentStateType = {};
  const gasLimit = BigNumber.from(`6000000`).mul(15).div(10);
  const estimateGasPrice = await provider.getGasPrice();
  const gasPrice = estimateGasPrice.mul(2);

  console.log(`\nBeginnning Testnet Deployment script on network ${network.name}...\n`);

  const sclpTokenAddress = "0xF2c96E402c9199682d5dED26D3771c6B192c01af";

  const startDate = new Date("October 27, 2021 15:00:00 UTC");
  const endDate = new Date("October 28, 2021 11:15:00 UTC");

  const fixedSwapsConfig: { key: string; token: string; fixedSwap: FixedSwapDeploymentType }[] = [
    {
      key: "SCLPscallopFixedSwap", // Combination of token in caps and id used in ui in lowercap.
      token: "SCLP",
      fixedSwap: {
        tradeValue: utils.parseEther(`1`).mul(82529911894).div(1e10).div(1e3),
        tokensForSale: utils.parseEther(`1`).mul(373333),
        startDate: BigNumber.from(`${Math.floor(startDate.getTime() / 1000)}`),
        endDate: BigNumber.from(`${Math.floor(endDate.getTime() / 1000)}`),
        individualMinimumAmount: BigNumber.from(0),
        individualMaximumAmount: BigNumber.from("300000000000000000000").mul(1000).div(375),
        isTokenSwapAtomic: false,
        minimumRaise: utils.parseEther(`0`),
        hasWhitelisting: true,
      },
    },
    {
      key: "SCLPscallopmahaxFixedSwap", // Combination of token in caps and id used in ui in lowercap.
      token: "SCLP",
      fixedSwap: {
        tradeValue: utils.parseEther(`1`).mul(82529911894).div(1e10).div(1e3),
        tokensForSale: utils.parseEther(`1`).mul(190000),
        startDate: BigNumber.from(`${Math.floor(startDate.getTime() / 1000)}`),
        endDate: BigNumber.from(`${Math.floor(endDate.getTime() / 1000)}`),
        individualMinimumAmount: BigNumber.from(0),
        individualMaximumAmount: BigNumber.from("750000000000000000000").mul(1000).div(375),
        isTokenSwapAtomic: false,
        minimumRaise: utils.parseEther(`0`),
        hasWhitelisting: true,
      },
    },
  ];

  for (const fixedSwapConfig of fixedSwapsConfig) {
    await deployFixedSwap(fixedSwapConfig.key, sclpTokenAddress, deploymentState, fixedSwapConfig.fixedSwap, {
      gasPrice,
      gasLimit,
    });

    await fundFixedSwap(fixedSwapConfig.key, sclpTokenAddress, deploymentState, fixedSwapConfig.fixedSwap, {
      gasPrice,
      gasLimit,
    });
  }

  console.log(`\nWriting deployments to output file...`);
  const deploymentStateJSON = JSON.stringify(deploymentState, null, 2);
  fs.writeFileSync(`./output/${network.name}.json`, deploymentStateJSON);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
