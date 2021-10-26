import hre from "hardhat";

export async function verifyContract(address: string, constructorArgs: any[] = []) {
  console.log(`Verifying contract at address ${address}...`);
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArgs,
    });
  } catch (error: any) {
    console.error(`- Error verifying ${address}`);
  }
}
