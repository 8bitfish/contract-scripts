const Fish = artifacts.require("BitFish");
module.exports = async (deployer, [defaultAccount]) => {
  Fish.setProvider(deployer.provider);
  await deployer.deploy(Fish);
};
