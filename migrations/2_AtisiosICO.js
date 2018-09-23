var AtisiosICO = artifacts.require("./AtisiosICO.sol");

module.exports = function(deployer) {
  const startTime = Math.round((new Date().getTime() + 60000)/1000); // Yesterday
  const endTime = Math.round((new Date().getTime() + (86400000 * 20))/1000); // Today + 20 days

  // For testing : Comment out line 33 of file node_modules/zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol
  deployer.deploy(AtisiosICO,
    startTime,
    endTime,
    33333,
    "0x0f54B832ECFABDE28b7CA80f816777e349759c7F",
    7083000000000000000000, // 7083 (~$2m) ETH
    122971000000000000000000 // 122971 (~$34.72m) ETH
  );
};
