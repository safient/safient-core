const { utils } = require('ethers');

const network = 'kovan';

// local
const arbitratorContract = 'AutoAppealableArbitrator';
const arbitrationFee = utils.parseEther('0.001').toNumber();

// testnet
const arbitratorAddress = '0xAa72231a8CC83cd87299a8E4F59ce0cb566B8B00';

// local && testnet
const arbitrableContract = 'SafexMain';

module.exports = { network, arbitratorContract, arbitrableContract, arbitrationFee, arbitratorAddress };
