# Safex Claims
#### Claim resolution platform for Safex using kleros arbitrable and evidence compatible contract.
```
git clone https://github.com/getsafex/safex-claims.git
```
Install hardhat dependencies
```
cd safex-claims
npm install
```
Install react dependencies
```
cd client
npm install
```
Hardhat flow :
* cd back into root folder
  ```
  cd ..
  ```
* Compile
  ```
  npm run compile
  ```
* Deployments and tests :
  * Hardhat Network
    * Deploy - no need to deploy
    * Test
      * change defaultNetwork to "hardhat" in hardhat.config.js file
        ```
        npm run test
        ```
  * Localhost
    * Deploy
      * change defaultNetwork to "localhost" in hardhat.config.js file
        * run a local JsonRpcProvider (chain) at localhost:8545
          ```
          npm run chain
          ```
        * open new terminal
        * deploy contract
          ```
          npm run deploy
          ```
    * Test
      ```
      npm run test
      ```
  * Testnet
    * Deploy
      * change defaultNetwork to required testnet in hardhat.config.js file, ex: "kovan", "ropsten"
      * change INFURA_API_KEY to your infura api key
      * change TESTNET_ACCOUNT_PRIVATE_KEY to your testnet's account's  private key
      * deploy contract
        ```
        npm run deploy
        ```
* Publish artifacts to the frontend
  ```
  npm run publish
  ```
  * access artifacts from ./subgraph folder and ./client/src/contracts folder