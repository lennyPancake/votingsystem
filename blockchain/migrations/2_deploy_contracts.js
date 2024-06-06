const Voting = artifacts.require("./Voting.sol");
module.exports = function (deployer) {
  deployer.deploy(Voting);
  //deployer.deploy(VotingToken, 3);
};
