export const NETWORK = (chainId) => {
  for (let n in NETWORKS) {
    if (NETWORKS[n].chainId === chainId) {
      return NETWORKS[n];
    }
  }
};

export const NETWORKS = {
  localhost: {
    name: 'localhost',
    chainId: 31337,
    rpcUrl: 'http://localhost:8545',
  },
  mainnet: {
    name: 'mainnet',
    chainId: 1,
    rpcUrl: 'https://mainnet.infura.io/v3/baba8e335c45440fbdd81a5812b65d06',
  },
  kovan: {
    name: 'kovan',
    chainId: 42,
    rpcUrl: 'https://kovan.infura.io/v3/baba8e335c45440fbdd81a5812b65d06',
  },
  rinkeby: {
    name: 'rinkeby',
    chainId: 4,
    rpcUrl: 'https://rinkeby.infura.io/v3/baba8e335c45440fbdd81a5812b65d06',
  },
  ropsten: {
    name: 'ropsten',
    chainId: 3,
    rpcUrl: 'https://ropsten.infura.io/v3/baba8e335c45440fbdd81a5812b65d06',
  },
};
