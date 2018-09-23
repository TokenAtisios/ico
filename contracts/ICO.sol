pragma solidity ^0.4.24;

import './Atisios.sol';
import 'zeppelin-solidity/contracts/crowdsale/distribution/FinalizableCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/distribution/RefundableCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/emission/MintedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/validation/CappedCrowdsale.sol';
import 'zeppelin-solidity/contracts/crowdsale/validation/TimedCrowdsale.sol';

contract AtisiosICO is CappedCrowdsale, RefundableCrowdsale, MintedCrowdsale {

  // ICO Stage
  // ============
  enum CrowdsaleStage { PreICO, ICO }
  CrowdsaleStage public stage = CrowdsaleStage.PreICO; // By default it's Pre Sale
  // =============

  // Token Distribution
  // =============================
  uint256 public maxTokens = 2000000000000000000000000000; // 2 000 000 000 ATIS (18 decimals)
  uint256 public tokensForTeam = 400000000000000000000000000; // 400 000 000 (20% of 2 000 000 000)
  uint256 public tokensForBounty = 40000000000000000000000000; // 40 000 000 (2% of 2 000 000 000)
  uint256 public totalTokensForSale = 1580000000000000000000000000; // 1 580 000 000 ATIS (18 decimals)
  uint256 public totalTokensForSaleDuringPreICO = 200000000000000000000000000; // 200 000 000 / 1 380 000 000
  // ==============================

  event EthTransferred(string text);
  event EthRefunded(string text);

  constructor(
    uint256 _startTime,
    uint256 _endTime,
    uint256 _rate,
    address _wallet,
    uint256 _goal,
    uint256 _cap
  ) TimedCrowdsale(_startTime, _endTime) CappedCrowdsale(_cap) FinalizableCrowdsale() RefundableCrowdsale(_goal) Crowdsale(_rate, _wallet, new AtisiosToken()) public {
      require(_goal <= _cap);
  }

  function createTokenContract() internal returns (MintableToken) {
    return new AtisiosToken(); // Deploys the ERC20 token. Automatically called when crowdsale contract is deployed
  }

  // Change Crowdsale Stage. Available Options: PreICO, ICO
  function setCrowdsaleStage(uint value) public onlyOwner {

      CrowdsaleStage _stage;

      if (uint(CrowdsaleStage.PreICO) == value) {
        _stage = CrowdsaleStage.PreICO;
      } else if (uint(CrowdsaleStage.ICO) == value) {
        _stage = CrowdsaleStage.ICO;
      }

      stage = _stage;

      if (stage == CrowdsaleStage.PreICO) {
        setCurrentRate(33333); // 0.00003 ethers per unit (30000000000000 wei)
      } else if (stage == CrowdsaleStage.ICO) {
        setCurrentRate(12500); // 0.00008 ethers per unit (80000000000000 wei)
      }
  }

  // Change the current rate
  function setCurrentRate(uint256 _rate) private {
      rate = _rate;
  }

  function () external payable {
      uint256 tokensThatWillBeMintedAfterPurchase = msg.value.mul(rate);
      if ((stage == CrowdsaleStage.PreICO) && (token.totalSupply() + tokensThatWillBeMintedAfterPurchase > totalTokensForSaleDuringPreICO)) {
        msg.sender.transfer(msg.value); // Refund them
        emit EthRefunded("PreICO Limit Hit"); // Pre-sale hardcap reached
        return;
      }

      buyTokens(msg.sender);
  }

  function _forwardFunds() internal {
      if (stage == CrowdsaleStage.PreICO) {
          wallet.transfer(msg.value);
          emit EthTransferred("forwarding funds to wallet");
      } else if (stage == CrowdsaleStage.ICO) {
          emit EthTransferred("forwarding funds to escrow");
          super._forwardFunds();
      }
  }

  // What's unsold is burnt
  function finish(address _teamFund, address _bountyFund) public onlyOwner {
      require(!isFinalized);

      super._deliverTokens(_teamFund,tokensForTeam);
      super._deliverTokens(_bountyFund,tokensForBounty);

      super.finalize();
  }
}
