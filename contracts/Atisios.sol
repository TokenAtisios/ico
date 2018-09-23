pragma solidity ^0.4.24;

import 'zeppelin-solidity/contracts/token/ERC20/MintableToken.sol';

contract AtisiosToken is MintableToken {
  string public name = "Atis";
  string public symbol = "ATIS";
  uint8 public decimals = 18;
}
