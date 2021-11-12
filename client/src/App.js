import { useCallback, useEffect, useState } from 'react';
import { StaticJsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { parseEther, formatEther } from '@ethersproject/units';
import { NETWORK } from './networks';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import { Text, Button, Tag, Dot, Page, Tabs, Loading, Spacer, Divider, useToasts, Modal, Input } from '@geist-ui/react';
import { SafientCore } from '@safient/core';

const localProvider = new StaticJsonRpcProvider('http://localhost:8545');

const App = () => {
  const [injectedProvider, setInjectedProvider] = useState(null);

  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [isNetwork, setIsNetwork] = useState(false);

  const [address, setAddress] = useState(null);
  const [balance, setBalance] = useState(null);

  const [sdk, setSdk] = useState(null);

  const [toasts, setToast] = useToasts();
  const [loading, setLoading] = useState(false);

  const [user, setUser] = useState(null);

  const [name, setName] = useState(null);
  const [email, setEmail] = useState(null);

  const [modal, setModal] = useState(true);

  const closeHandler = (event) => {
    setModal(false);
  };

  const loadWeb3Modal = useCallback(() => {
    async function setProvider() {
      const provider = await web3Modal.connect();
      const injectedProvider = new Web3Provider(provider);
      setInjectedProvider(injectedProvider);
      await connectUser(injectedProvider);
    }
    setProvider();
  }, [setInjectedProvider]);

  const connectUser = async (provider) => {
    const network = await provider.getNetwork();
    const chainId = network.chainId;
    const selectedNetwork = NETWORK(chainId);

    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setAddress(address);
    const balance = await signer.getBalance();
    setBalance(formatEther(balance));

    const sdk = new SafientCore(signer, chainId, 'threadDB');
    setSdk(sdk);

    if (selectedNetwork !== null && selectedNetwork !== undefined) {
      setSelectedNetwork(selectedNetwork);
      if (selectedNetwork.chainId == 31337 || selectedNetwork.chainId == 1 || selectedNetwork.chainId == 4) {
        setIsNetwork(true);

        if (user === null) {
          setLoading(true);
          const res = await sdk.loginUser('bjotvawozxytpzemtrei3a2zquq', 'b55myxtcfe3fqgwze7hbr336in3avvbbkj3kzfda');
          if (!res.status) {
            setToast({ text: `User dosen't exist! Create a new user.`, type: 'warning' });
            setLoading(false);
          } else {
            setToast({ text: `You are loged in!`, type: 'success' });
            const user = await sdk.getUser({ email: res.data.email });
            setUser(user);
            setLoading(false);
          }
        }
      }
    }
  };

  useEffect(() => {
    async function init() {
      if (web3Modal.cachedProvider) {
        loadWeb3Modal();
      }
    }
    init();
  }, [loadWeb3Modal]);

  const createUser = async (e) => {
    e.preventDefault();
    if (name !== null && email !== null) {
      setLoading(true);
      const user = await sdk.createUser(name, email, 0, address);
      if (user.status) {
        setLoading(false);
      }
    }
  };

  return (
    <>
      <Page style={{ width: '1000px' }}>
        <Page.Content>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>Safient Core</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              {selectedNetwork !== null && selectedNetwork !== undefined ? (
                <>
                  <Dot style={{ marginRight: '20px' }} type='success'>
                    {selectedNetwork.chainId} - {selectedNetwork.name}
                  </Dot>
                </>
              ) : null}
              <Spacer />
              {address !== null && balance !== null ? (
                <>
                  <Button type='secondary' auto width='30%' mx='5px' onClick={logoutOfWeb3Modal}>
                    Disconnect
                  </Button>
                </>
              ) : (
                <>
                  <Button type='secondary' auto width='30%' mx='5px' onClick={loadWeb3Modal}>
                    Connect
                  </Button>
                </>
              )}
            </div>
          </div>
          <Spacer />
          {address !== null && balance !== null ? (
            <>
              <Tabs initialValue='1'>
                <Tabs.Item label='Account' value='1'>
                  <Spacer />
                  <h4>Wallet Details</h4>
                  <Text>{address}</Text>
                  <Text>{balance} ETH</Text>
                  <Divider />
                  {isNetwork ? (
                    <>
                      {!loading && user !== null ? (
                        <>
                          <h4>Login Details</h4>
                          <Text>{user.did}</Text>
                          <Text>{user.name}</Text>
                          <Text>{user.email}</Text>
                        </>
                      ) : (
                        <>
                          <Spacer />
                          <Loading type='secondary'>Sign the message & wait for a few seconds to log in </Loading>
                        </>
                      )}
                    </>
                  ) : (
                    <Modal width='50rem' visible={modal} onClose={closeHandler}>
                      <Text h3>Select supported network!</Text>
                      <Modal.Content>
                        <Spacer />
                        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                          <Button auto type='secondary-light' disabled onClick={() => changeNetwork('0x1')}>
                            1 - Mainnet
                          </Button>
                          <Button auto type='secondary-light' onClick={() => changeNetwork('0x4')}>
                            4 - Rinkeby
                          </Button>
                          <Button auto type='secondary-light' onClick={() => changeNetwork('0x31337')}>
                            31337 - Localhost
                          </Button>
                        </div>
                      </Modal.Content>
                    </Modal>
                  )}
                </Tabs.Item>
                <Tabs.Item label='Create User' value='2'>
                  <Spacer y={2} />
                  <form>
                    <Input status='secondary' onChange={(e) => setName(e.target.value)} width='50%'>
                      <Text b>Name :</Text>
                    </Input>
                    <Input status='secondary' onChange={(e) => setEmail(e.target.value)} width='50%'>
                      <Text b>Email :</Text>
                    </Input>
                    <Spacer />
                    <Spacer y={2} />
                    {!loading ? (
                      <Button type='secondary' auto onClick={createUser}>
                        Create User
                      </Button>
                    ) : (
                      <Button type='secondary' auto loading>
                        Create User
                      </Button>
                    )}
                  </form>
                </Tabs.Item>
              </Tabs>
            </>
          ) : null}
        </Page.Content>
      </Page>
    </>
  );
};

const changeNetwork = async (network) => {
  if (window.ethereum) {
    try {
      await window.ethereum.enable();
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network }],
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const web3Modal = new Web3Modal({
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,
      options: {
        infuraId: 'baba8e335c45440fbdd81a5812b65d06',
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
