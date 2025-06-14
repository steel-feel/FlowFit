// 

import React from 'react';
import AppNavigator from './src/AppNavigator';
import '@walletconnect/react-native-compat';

import { createAppKit, defaultConfig, AppKit } from '@reown/appkit-ethers-react-native';

// 1. Get projectId from https://cloud.reown.com
const projectId = '05468067e7445a54c35dcf7e58fdba4f';

// 2. Create config
const metadata = {
  name: 'Flowfit',
  description: 'Flowfit app : build flowing healthy habits',
  url: 'https://flow.fit/appkit',
  icons: ['https://picsum.photos/200'],
  redirect: {
    native: 'YOUR_APP_SCHEME://',
  },
};

const config = defaultConfig({ metadata });

// 3. Define your chains
const flowmainnet = {
  chainId: 747,
  name: 'Flow EVM Mainnet',
  currency: 'FLOW',
  explorerUrl: 'https://evm.flowscan.io',
  rpcUrl: 'https://mainnet.evm.nodes.onflow.org'
};


const chains = [flowmainnet];

// 4. Create modal
createAppKit({
  projectId,
  chains,
  config,
  enableAnalytics: true, // Optional - defaults to your Cloud configuration
  defaultChain: flowmainnet, // Optional - defaults to the first chain in your list
});

export default function App() {
  return (
    <>
      <AppNavigator />
      <AppKit />
    </>
  );
}

// const App: React.FC = () => <AppNavigator />;

// export default App;
