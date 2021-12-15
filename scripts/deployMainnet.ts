/* eslint-disable node/no-missing-import */
import * as fs from "fs";

import { ethers, network } from "hardhat";
import { Overrides, utils, BigNumber } from "ethers";

import { verifyContract, wait } from "./utils";
import { DeploymentStateType, FixedSwapDeploymentType } from "./types";

const { provider } = ethers;

async function deployFixedSwap(
  key: string,
  forwardAddress: string,
  busdAddress: string,
  deploymentState: DeploymentStateType,
  constructorArgs: FixedSwapDeploymentType,
  overrides: Overrides & { from?: string | Promise<string> }
) {
  const FixedSwapFactory = await ethers.getContractFactory("FixedSwap");

  console.log(`\nDeploying FixedSwap with ERC20:${forwardAddress}...`);
  const fixedSwap = await FixedSwapFactory.deploy(
    busdAddress,
    forwardAddress,
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

  console.log("waiting for 30s");
  await wait(30 * 1000);

  console.log("verify", fixedSwap.address, Object.values(constructorArgs));
  await verifyContract(fixedSwap.address, Object.values(constructorArgs));
}

async function fundFixedSwap(
  key: string,
  forwardAddress: string,
  deploymentState: DeploymentStateType,
  constructorArgs: FixedSwapDeploymentType,
  overrides: Overrides & { from?: string | Promise<string> }
) {
  const fixedSwap = await ethers.getContractAt("FixedSwap", deploymentState[key].address);
  const erc20 = await ethers.getContractAt("MockERC20", forwardAddress);

  console.log(`\nApproving ERC20:${erc20.address} to fund FixedSwap:${fixedSwap.address}...`);
  await erc20.approve(fixedSwap.address, constructorArgs.tokensForSale, overrides);

  // console.log(`Funding ERC20:${erc20.address} to fund FixedSwap:${fixedSwap.address}...`);
  // await fixedSwap.fund(constructorArgs.tokensForSale, overrides);
}

async function main() {
  const deploymentState: DeploymentStateType = {};
  const gasLimit = BigNumber.from(`6000000`).mul(15).div(10);
  const estimateGasPrice = await provider.getGasPrice();
  const gasPrice = estimateGasPrice.mul(2);

  console.log(`\nBeginnning Testnet Deployment script on network ${network.name}...\n`);

  const busd = "0xe9e7cea3dedca5984780bafc599bd69add087d56";
  const forward = "0x886640149E31E1430FA74Cc39725431eb82ddFB2";

  const startDate = new Date("December 15, 2021 15:00:00 UTC").getTime();
  const endDate = new Date("January 2, 2022 15:15:00 UTC").getTime();

  const fixedSwapsConfig: { key: string; token: string; inputToken: string; fixedSwap: FixedSwapDeploymentType }[] = [
    {
      key: "FORWARDforwardFixedSwap",
      token: forward,
      inputToken: busd,
      fixedSwap: {
        tradeValue: utils.parseEther(`1`).mul(2).div(1e2),
        tokensForSale: utils.parseEther(`1`).mul(1000000),
        startDate: BigNumber.from(`${Math.floor(startDate / 1000)}`),
        endDate: BigNumber.from(`${Math.floor(endDate / 1000)}`),
        individualMinimumAmount: BigNumber.from(0),
        individualMaximumAmount: utils.parseEther(`1`).mul(50).mul(100).div(2),
        isTokenSwapAtomic: false,
        minimumRaise: utils.parseEther(`0`),
        hasWhitelisting: true,
      },
    },
    {
      key: "FORWARDforwardmahaxFixedSwap",
      token: forward,
      inputToken: busd,
      fixedSwap: {
        tradeValue: utils.parseEther(`1`).mul(2).div(1e2),
        tokensForSale: utils.parseEther(`1`).mul(1750000),
        startDate: BigNumber.from(`${Math.floor(startDate / 1000)}`),
        endDate: BigNumber.from(`${Math.floor(endDate / 1000)}`),
        individualMinimumAmount: BigNumber.from(0),
        individualMaximumAmount: utils.parseEther(`1`).mul(300).mul(100).div(2),
        isTokenSwapAtomic: false,
        minimumRaise: utils.parseEther(`0`),
        hasWhitelisting: true,
      },
    },
    {
      key: "FORWARDforwardmahax2FixedSwap",
      token: forward,
      inputToken: busd,
      fixedSwap: {
        tradeValue: utils.parseEther(`1`).mul(2).div(1e2),
        tokensForSale: utils.parseEther(`1`).mul(1750000),
        startDate: BigNumber.from(`${Math.floor(startDate / 1000)}`),
        endDate: BigNumber.from(`${Math.floor(endDate / 1000)}`),
        individualMinimumAmount: BigNumber.from(0),
        individualMaximumAmount: utils.parseEther(`1`).mul(160).mul(100).div(2),
        isTokenSwapAtomic: false,
        minimumRaise: utils.parseEther(`0`),
        hasWhitelisting: true,
      },
    },
    {
      key: "FORWARDforwardsquareupFixedSwap",
      token: forward,
      inputToken: busd,
      fixedSwap: {
        tradeValue: utils.parseEther(`1`).mul(2).div(1e2),
        tokensForSale: utils.parseEther(`1`).mul(500000),
        startDate: BigNumber.from(`${Math.floor(startDate / 1000)}`),
        endDate: BigNumber.from(`${Math.floor(endDate / 1000)}`),
        individualMinimumAmount: BigNumber.from(0),
        individualMaximumAmount: utils.parseEther(`1`).mul(131).mul(100).div(2),
        isTokenSwapAtomic: false,
        minimumRaise: utils.parseEther(`0`),
        hasWhitelisting: true,
      },
    },
  ];

  for (const fixedSwapConfig of fixedSwapsConfig) {
    await deployFixedSwap(
      fixedSwapConfig.key,
      fixedSwapConfig.token,
      fixedSwapConfig.inputToken,
      deploymentState,
      fixedSwapConfig.fixedSwap,
      {
        gasPrice,
        gasLimit,
      }
    );

    await fundFixedSwap(fixedSwapConfig.key, fixedSwapConfig.token, deploymentState, fixedSwapConfig.fixedSwap, {
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
