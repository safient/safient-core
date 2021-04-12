# Safex Claims
#### An implementation of kleros arbitrable and evidence compatible contract to create and rule disputes.
#
### Deployments
#### SafexMain Smart Contract is deployed to Ropsten Testnet - [0x69d36535524997af56c2cb28af019d0f997e5044](https://ropsten.etherscan.io/address/0x69d36535524997af56c2cb28af019d0f997e5044)
#### Access Safex Claims DApp at [SafexClaims](https://devpavan04.github.io/safex-claims/#/).
#
### Run the DApp Locally
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
#### Open new terminal window and clone this repository
```
git clone https://github.com/devpavan04/safex-claims.git
```
#### Install dependencies
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
