/* eslint-disable node/no-missing-import */
import * as fs from "fs";

import { ethers, network } from "hardhat";
import { Contract, Overrides, utils, BigNumber } from "ethers";

import { verifyContract } from "./utils";
import { DeploymentStateType, FixedSwapDeploymentType } from "./types";

const { provider } = ethers;

async function deployMockERC20(
  deploymentState: DeploymentStateType,
  token: string,
  overrides: Overrides & { from?: string | Promise<string> }
) {
  let mockERC20Contract: Contract;

  if (!deploymentState[token]) {
    const MockERC20Factory = await ethers.getContractFactory("MockERC20");
    mockERC20Contract = await MockERC20Factory.deploy(token, token, overrides);

    await mockERC20Contract.deployed();
    console.log(`\nDeployed MockERC20 at ${mockERC20Contract.address}...`);

    deploymentState[token] = {
      abi: "MockERC20",
      address: mockERC20Contract.address,
    };

    // await verifyContract(mockERC20Contract.address, [token, token]);
  } else {
    mockERC20Contract = await ethers.getContractAt("MockERC20", deploymentState[token].address);
  }
}

async function deployFixedSwap(
  key: string,
  token: string,
  inputToken: string,
  deploymentState: DeploymentStateType,
  constructorArgs: FixedSwapDeploymentType,
  overrides: Overrides & { from?: string | Promise<string> }
) {
  const FixedSwapFactory = await ethers.getContractFactory("FixedSwap");

  console.log(`\nDeploying FixedSwap with ERC20:${deploymentState[token].address}...`);
  const fixedSwap = await FixedSwapFactory.deploy(
    deploymentState[inputToken].address,
    deploymentState[token].address,
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

  await verifyContract(fixedSwap.address, Object.values(constructorArgs));
}

async function fundFixedSwap(
  key: string,
  token: string,
  deploymentState: DeploymentStateType,
  constructorArgs: FixedSwapDeploymentType,
  overrides: Overrides & { from?: string | Promise<string> }
) {
  const fixedSwap = await ethers.getContractAt("FixedSwap", deploymentState[key].address);
  const erc20 = await ethers.getContractAt("MockERC20", deploymentState[token].address);

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

  const tokens: string[] = ["BUSD", "FORWARD"];
  for (const token of tokens) {
    await deployMockERC20(deploymentState, token, { gasPrice, gasLimit });
  }

  const startDate = Date.now() + 10 * 60 * 1000;
  const endDate = Date.now() + 30 * 60 * 1000;

  const fixedSwapsConfig: { key: string; token: string; inputToken: string; fixedSwap: FixedSwapDeploymentType }[] = [
    {
      key: "FORWARDforwardFixedSwap", // Public sale.
      token: "FORWARD",
      inputToken: "BUSD",
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
      key: "FORWARDforwardmahaxFixedSwap", // T1.
      token: "FORWARD",
      inputToken: "BUSD",
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
      key: "FORWARDforwardmahax2FixedSwap", // T2.
      token: "FORWARD",
      inputToken: "BUSD",
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
      key: "FORWARDforwardsquareupFixedSwap", // Square up.
      token: "FORWARD",
      inputToken: "BUSD",
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
