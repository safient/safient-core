import React, { useCallback, useEffect, useState } from "react";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useUserProvider, useContractLoader, useBalance } from "./hooks";
import { INFURA_ID, NETWORKS } from "./constants";
import { Text, Page, Tabs, Row, Col, Spacer } from "@geist-ui/react";

import ContractsNotDeployed from "./components/ContractsNotDeployed/ContractsNotDeployed";
import ConnectWeb3Modal from "./components/ConnectWeb3Modal/ConnectWeb3Modal";
import SafexMainDetails from "./components/SafexMainDetails/SafexMainDetails";
import SubmitEvidence from "./components/SubmitEvidence/SubmitEvidence";
import CreateClaim from "./components/CreateClaim/CreateClaim";
import CreatePlan from "./components/CreatePlan/CreatePlan";
import MyAccount from "./components/MyAccount/MyAccount";
import Claims from "./components/Claims/Claims";
import Funds from "./components/Funds/Funds";
import Plans from "./components/Plans/Plans";

const targetNetwork = NETWORKS["localhost"];
const localProviderUrl = targetNetwork.rpcUrl;
const localProviderUrlFromEnv = process.env.REACT_APP_PROVIDER ? process.env.REACT_APP_PROVIDER : localProviderUrl;
const localProvider = new StaticJsonRpcProvider(localProviderUrlFromEnv);

function App() {
  const [injectedProvider, setInjectedProvider] = useState();

  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);
  const balance = useBalance(userProvider, address);
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;
  const writeContracts = useContractLoader(userProvider);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  useEffect(() => {
    if (web3Modal.cachedProvider) loadWeb3Modal();
  }, [loadWeb3Modal]);

  return (
    <Page size="large">
      <Row align="middle">
        <Col span={20}>
          <Page.Header>
            <Text h2>Safex Claims</Text>
          </Page.Header>
        </Col>
        <Col span={4}>
          <ConnectWeb3Modal web3Modal={web3Modal} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
        </Col>
      </Row>
      {localChainId && selectedChainId && localChainId != selectedChainId ? (
        <ContractsNotDeployed localChainId={localChainId} selectedChainId={selectedChainId} />
      ) : (
        <>
          <Spacer y={1} />
          <Tabs initialValue="2">
            <Spacer y={1} />
            <Tabs.Item label="safex" value="1">
              <SafexMainDetails writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label="account" value="2">
              <MyAccount address={address} balance={balance} />
            </Tabs.Item>
            <Tabs.Item label="create plan" value="3">
              <CreatePlan network={targetNetwork.name} address={address} writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label="create claim" value="4">
              <CreateClaim network={targetNetwork.name} writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label="submit evidence" value="5">
              <SubmitEvidence writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label="funds" value="6">
              <Funds writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label="plans" value="7">
              <Plans writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label="claims" value="8">
              <Claims writeContracts={writeContracts} />
            </Tabs.Item>
          </Tabs>
        </>
      )}
    </Page>
  );
}

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: INFURA_ID,
      },
    },
  },
  theme: "dark",
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

window.ethereum &&
  window.ethereum.on("chainChanged", (chainId) => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

window.ethereum &&
  window.ethereum.on("accountsChanged", (accounts) => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

export default App;
