var AtisiosICO = artifacts.require("AtisiosICO");
var AtisiosToken = artifacts.require("AtisiosToken");

contract('AtisiosICO', function(accounts) {
    it('should deploy the token and store the address', function(done){
        AtisiosICO.deployed().then(async function(instance) {
            const token = await instance.token.call();
            assert(token, 'Token address couldn\'t be stored');
            done();
       });
    });

    it('should set stage to PreICO', function(done){
        AtisiosICO.deployed().then(async function(instance) {
          await instance.setCrowdsaleStage(0);
          const stage = await instance.stage.call();
          assert.equal(stage.toNumber(), 0, 'The stage couldn\'t be set to PreICO');
          done();
       });
    });

    it('one ETH should buy 33333 ATIS Tokens in PreICO', function(done) {
        AtisiosICO.deployed().then(async function(instance) {
            const data = await instance.sendTransaction({ from: accounts[8], value: web3.toWei(1, "ether")});
            const tokenAddress = await instance.token.call();
            const atis = AtisiosToken.at(tokenAddress);
            const tokenAmount = await atis.balanceOf(accounts[8]);
            assert.equal(tokenAmount.toNumber(), 33333000000000000000000, 'The sender didn\'t receive the tokens as per PreICO rate');
            done();
       });
    });

    it('should directly transfer wei to beneficiary when in PreICO', function(done) {
        AtisiosICO.deployed().then(async function(instance) {
            let balanceOfBeneficiary = await web3.eth.getBalance(accounts[0]);

            await instance.sendTransaction({ from: accounts[8], value: web3.toWei(1, "ether")});

            let newBalanceOfBeneficiary = await web3.eth.getBalance(accounts[0]);

            assert.equal(newBalanceOfBeneficiary.toNumber(), balanceOfBeneficiary.toNumber() + 1000000000000000000, 'ETH couldn\'t be transferred to the beneficiary');
            done();
        });
    });

    it('should set stage to ICO', function(done){
        AtisiosICO.deployed().then(async function(instance) {
          await instance.setCrowdsaleStage(1);
          const stage = await instance.stage.call();
          assert.equal(stage.toNumber(), 1, 'The stage couldn\'t be set to ICO');
          done();
       });
    });

    it('one ETH should buy 12500 ATIS Tokens in ICO', function(done){
        AtisiosICO.deployed().then(async function(instance) {
            const data = await instance.sendTransaction({ from: accounts[9], value: web3.toWei(1, "ether")});
            const tokenAddress = await instance.token.call();
            const atis = AtisiosToken.at(tokenAddress);
            const tokenAmount = await atis.balanceOf(accounts[9]);
            assert.equal(tokenAmount.toNumber(), 12500000000000000000000, 'The sender didn\'t receive the tokens as per ICO rate');
            done();
       });
    });

    it('Escrow balance should be added to our wallet once ICO is over', function(done){
        AtisiosICO.deployed().then(async function(instance) {
            let balanceOfBeneficiary = await web3.eth.getBalance(accounts[0]);

            // add up +60 days
            await web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'evm_increaseTime',
                params: [60 * 60 * 24 * 60],
                id: 0,
            });

            await web3.currentProvider.send({
                jsonrpc: '2.0',
                method: 'evm_mine',
                params: [],
                id: 1,
            });

            let weiRaised = await instance.weiRaised.call();

            let teamFund = accounts[2];
            let bountyFund = accounts[3];
            await instance.finish(teamFund, bountyFund);

            let newBalanceOfBeneficiary = await web3.eth.getBalance(accounts[0]);

            assert.isAbove(newBalanceOfBeneficiary.toNumber(), balanceOfBeneficiary.toNumber(), 'Escrow balance couldn\'t be sent to the wallet');
            done();
       });
    });

    it('Sends tokens to teamFund and bountyFund after finalizing', function(done) {
        AtisiosICO.deployed().then(async function(instance) {
            let teamFund = accounts[2];
            let bountyFund = accounts[3];

            const tokenAddress = await instance.token.call();
            const atis = AtisiosToken.at(tokenAddress);

            const tokenFundAmount = await atis.balanceOf(teamFund);
            const bountyFundAmount = await atis.balanceOf(bountyFund);

            assert.equal(tokenFundAmount.toNumber(), 400000000000000000000000000, 'Couldn\'t send tokens to team');
            assert.equal(bountyFundAmount.toNumber(), 40000000000000000000000000, 'Couldn\'t send tokens to bounty');
            done();
        });
    });

    it('Should finished with the correct total supply', function(done) {
        AtisiosICO.deployed().then(async function(instance) {
            const tokenAddress = await instance.token.call();
            const atis = AtisiosToken.at(tokenAddress);

            let teamFund = accounts[2];
            let bountyFund = accounts[3];

            const tokenAmountA = await atis.balanceOf(accounts[8]);
            const tokenAmountB = await atis.balanceOf(accounts[9]);
            const tokenFundAmount = await atis.balanceOf(teamFund);
            const bountyFundAmount = await atis.balanceOf(bountyFund);

            const expectedTotalSupply = tokenAmountA.toNumber() + tokenAmountB.toNumber() + tokenFundAmount.toNumber() + bountyFundAmount.toNumber();

            const totalSupply = await atis.totalSupply.call();

            assert.equal(expectedTotalSupply, totalSupply.toNumber(), 'Bad total supply');
            done();
        });
    })
});
