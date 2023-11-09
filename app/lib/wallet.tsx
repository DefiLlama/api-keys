import {
  connectorsForWallets,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  rabbyWallet,
  ledgerWallet,
  walletConnectWallet,
  frameWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { type ReactNode } from "react";
import { createConfig, configureChains, WagmiConfig } from "wagmi";
import { optimism } from "wagmi/chains";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [optimism],
  [
    jsonRpcProvider({
      rpc: () => ({
        http: "https://rpc.ankr.com/optimism",
      }),
    }),
  ]
);

const connectors = connectorsForWallets([
  {
    groupName: "Popular",
    wallets: [
      injectedWallet({ chains }),
      rabbyWallet({ chains }),
      frameWallet({ chains }),
      ledgerWallet({ chains, projectId: "2b0fa925a6e30cf250c05823fa9ef890" }),
      metaMaskWallet({ chains, projectId: "2b0fa925a6e30cf250c05823fa9ef890" }),
      rainbowWallet({ chains, projectId: "2b0fa925a6e30cf250c05823fa9ef890" }),
      walletConnectWallet({
        chains,
        projectId: "2b0fa925a6e30cf250c05823fa9ef890",
      }),
    ],
  },
]);

const config = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
  webSocketPublicClient,
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider
        chains={chains}
        theme={lightTheme({ borderRadius: "none", fontStack: "system" })}
      >
        {children}
      </RainbowKitProvider>
    </WagmiConfig>
  );
};
