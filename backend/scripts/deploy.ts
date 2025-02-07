const hre = require("hardhat");

async function main() {
    await hre.run('compile');

    const RealEstateTokenization = await hre.ethers.getContractFactory("RealEstateTokenization");
    const realEstateTokenization = await RealEstateTokenization.deploy();
    await realEstateTokenization.waitForDeployment();

    console.log("RealEstateTokenization Contract Address", await realEstateTokenization.getAddress())
}

main().then( () => process.exit(0))
.catch( (error) => {
    console.error(error);
    process.exit(1);
});