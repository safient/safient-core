# Safex Claims
#### Claim resolution platform for Safex using kleros arbitrable and evidence compatible contract.
#
### Deployments
#### SafexMain Smart Contract is deployed to Ropsten Testnet - [0x69d36535524997af56c2cb28af019d0f997e5044](https://ropsten.etherscan.io/address/0x69d36535524997af56c2cb28af019d0f997e5044)
#

#### Install truffle
```
npm install -g truffle
```
#### Install ganache-cli
```
npm i ganache-cli
```
#### Run ganache-cli
```
ganache-cli --port 7545 --quiet
```

### Quick start
```
cd safex-claims
npm install
cd client
npm install
```
#### Compile smart contract
```
cd ..
truffle compile
```
#### Deploy smart contract to ganache
```
truffle migrate
```
#### Test smart contract
```
truffle test
```
#### Start DApp
```
npm start
```
#### Open metamask browser wallet and select network to Localhost 7545.
