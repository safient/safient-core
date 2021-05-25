import React, { useCallback, useEffect, useState } from 'react';
import { StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { useUserAddress } from 'eth-hooks';
import { useUserProvider, useContractLoader, useBalance } from './hooks';
import { NETWORKS } from './networks';
import { Text, Page, Tabs, Row, Col, Spacer } from '@geist-ui/react';

import ContractsNotDeployed from './components/ContractsNotDeployed/ContractsNotDeployed';
import ConnectWeb3Modal from './components/ConnectWeb3Modal/ConnectWeb3Modal';
import SafexMainDetails from './components/SafexMainDetails/SafexMainDetails';
import SubmitEvidence from './components/SubmitEvidence/SubmitEvidence';
import CreateClaim from './components/CreateClaim/CreateClaim';
import CreateSafe from './components/CreateSafe/CreateSafe';
import MyAccount from './components/MyAccount/MyAccount';
import Claims from './components/Claims/Claims';
import Funds from './components/Funds/Funds';
import Safes from './components/Safes/Safes';

const targetNetwork = NETWORKS['localhost'];
const localProviderUrl = targetNetwork.rpcUrl;
const localProvider = new StaticJsonRpcProvider(localProviderUrl);

function App() {
  const [injectedProvider, setInjectedProvider] = useState();

  const userProvider = useUserProvider(injectedProvider);
  const address = useUserAddress(userProvider);
  const balance = useBalance(userProvider, address);
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;
  const writeContracts = useContractLoader(userProvider);

  const loadWeb3Modal = useCallback(() => {
    async function setProvider() {
      const provider = await web3Modal.connect();
      setInjectedProvider(new Web3Provider(provider));
    }
    setProvider();
  }, [setInjectedProvider]);

  useEffect(() => {
    function init() {
      if (web3Modal.cachedProvider) {
        loadWeb3Modal();
      }
    }
    init();
  }, [loadWeb3Modal]);

  return (
    <Page size='large'>
      <Row align='middle'>
        <Col span={20}>
          <Page.Header>
            <Text h2>Safex Claims</Text>
          </Page.Header>
        </Col>
        <Col span={4}>
          <ConnectWeb3Modal web3Modal={web3Modal} loadWeb3Modal={loadWeb3Modal} logoutOfWeb3Modal={logoutOfWeb3Modal} />
        </Col>
      </Row>
      {injectedProvider === undefined ? (
        <Text>A claim resolution platform for all the safex safes</Text>
      ) : localChainId && selectedChainId && localChainId != selectedChainId ? (
        <ContractsNotDeployed localChainId={localChainId} selectedChainId={selectedChainId} />
      ) : (
        <>
          <Spacer y={1} />
          <Tabs initialValue='2'>
            <Spacer y={1} />
            <Tabs.Item label='safex' value='1'>
              <SafexMainDetails writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label='account' value='2'>
              <MyAccount address={address} balance={balance} writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label='create safe' value='3'>
              <CreateSafe network={targetNetwork.name} address={address} writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label='create claim' value='4'>
              <CreateClaim network={targetNetwork.name} writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label='submit evidence' value='5'>
              <SubmitEvidence writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label='funds' value='6'>
              <Funds writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label='safes' value='7'>
              <Safes writeContracts={writeContracts} />
            </Tabs.Item>
            <Tabs.Item label='claims' value='8'>
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
        infuraId: process.env.REACT_APP_INFURA_API_KEY,
      },
    },
  },
  theme: 'dark',
});

const logoutOfWeb3Modal = async () => {
  await web3Modal.clearCachedProvider();
  setTimeout(() => {
    window.location.reload();
  }, 1);
};

window.ethereum &&
  window.ethereum.on('chainChanged', (chainId) => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

window.ethereum &&
  window.ethereum.on('accountsChanged', (accounts) => {
    web3Modal.cachedProvider &&
      setTimeout(() => {
        window.location.reload();
      }, 1);
  });

export default App;
