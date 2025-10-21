import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';
import { SEPOLIA_RPC_URL } from './contract';

export const config = getDefaultConfig({
  appName: 'CovertArbitrage-Deck',
  projectId: 'f75aa51f91e1e3fb5c666e41e370ef22',
  chains: [{
    ...sepolia,
    rpcUrls: {
      default: {
        http: [SEPOLIA_RPC_URL],
      },
      public: {
        http: [SEPOLIA_RPC_URL],
      },
    },
  }],
  ssr: false,
});
