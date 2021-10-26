import { BigNumber } from "ethers";

export type DeploymentStateType = { [name: string]: { abi: string; address: string } };

export type FixedSwapDeploymentType = {
  tradeValue: BigNumber;
  tokensForSale: BigNumber;
  startDate: BigNumber;
  endDate: BigNumber;
  individualMinimumAmount: BigNumber;
  individualMaximumAmount: BigNumber;
  isTokenSwapAtomic: boolean;
  minimumRaise: BigNumber;
  hasWhitelisting: boolean;
};
