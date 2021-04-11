const AutoAppealableArbitrator = artifacts.require("../client/src/contracts/AutoAppealableArbitrator");
const SafexMain = artifacts.require("../client/src/contracts/SafexMain");

module.exports = function (deployer) {
  deployer.deploy(AutoAppealableArbitrator, 1000000000000000).then((res) => {
    return deployer.deploy(SafexMain, res.address);
  });
};
