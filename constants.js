const { utils } = require('ethers');

const network = 'kovan';

// local
const arbitratorContract = 'AutoAppealableArbitrator';
const arbitrationFee = utils.parseEther('0.001').toNumber();

// testnet
const arbitratorAddress = '0xf31Fb836E463eBd00B792B10f48D7a1DFfC02731';

// local && testnet
const arbitrableContract = 'SafexMain';

module.exports = { network, arbitratorContract, arbitrableContract, arbitrationFee, arbitratorAddress };
