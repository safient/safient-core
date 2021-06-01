import React, { useCallback, useEffect, useState } from "react";
import { StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import { useUserAddress } from "eth-hooks";
import { useUserProvider, useContractLoader, useBalance } from "./hooks";
import { NETWORKS } from "./networks";
import { Text, Page, Tabs, Row, Col, Spacer } from "@geist-ui/react";
import {generateSignature} from "./lib/signerConnect"
import {generateIDX} from "./lib/identity"
import {definitions} from "./utils/config.json";
import {loginUserWithChallenge} from "./utils/threadDB"
import {getLoginUser, getSafeData} from './lib/safientDB'
import {PrivateKey} from "@textile/hub"

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
import Profile from "./components/Profile/Profile";
import Content from "./components/Safes/Content";

const targetNetwork = NETWORKS['localhost'];
const localProviderUrl = targetNetwork.rpcUrl;
const localProvider = new StaticJsonRpcProvider(localProviderUrl);

function App() {
  const [injectedProvider, setInjectedProvider] = useState();
  const [ceramic, setCeramic] = useState(null);
  const [idx, setIdx] = useState(null);
  const [user, setUser] = useState(0);
  const [userData, setUserData] =useState([]);
  const [identity, setIdentity] = useState(null);
  const [provider, setProvider] = useState(null);
  const userProvider = useUserProvider(injectedProvider, localProvider);
  const address = useUserAddress(userProvider);
  const balance = useBalance(userProvider, address);
  const localChainId = localProvider && localProvider._network && localProvider._network.chainId;
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;
  const writeContracts = useContractLoader(userProvider);

  const connectUser = async (provider) => {
    console.log('connect')
    const {seed, web3Provider} = await generateSignature(provider);
    setProvider(web3Provider)
    const {idx, ceramic} = await generateIDX(seed);
    setIdx(idx)
    console.log(idx)
    const identity = PrivateKey.fromRawEd25519Seed(Uint8Array.from(seed))
    setIdentity(identity)
    let threadData = null
    const client = await loginUserWithChallenge(identity);
    if (client !== null) {
      //call middleWare
      setCeramic(ceramic)
      threadData = await getLoginUser(idx.id)
    }
    console.log(client)
    const data = await idx.get(definitions.profile, idx.id)
    setUserData(threadData)
    setUser((threadData && data) ? 2 : 1)
    return {idx, identity, threadData}
  }

  const loadWeb3Modal = useCallback(() => {
    async function setProvider() {
      const provider = await web3Modal.connect();
      setInjectedProvider(new Web3Provider(provider));
      console.log(provider)
      await connectUser(null);
    }
    setProvider();
  }, [setInjectedProvider]);

  // useEffect(() => {
  //   function init() {
  //     if (web3Modal.cachedProvider) {
  //       loadWeb3Modal();
  //     }
  //   }
  //   init();
  // }, [loadWeb3Modal]);

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
            <Tabs.Item label="Safe" value="9">
              <Content idx={idx} user={user} userData={userData} />
            </Tabs.Item>
            <Tabs.Item label="profile" value="10">
              <Profile ceramic={ceramic} idx={idx} identity={identity} user={user} userData={userData} setUser={setUser} setUserData={setUserData}/>
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
