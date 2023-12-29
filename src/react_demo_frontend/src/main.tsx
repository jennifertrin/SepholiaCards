import "./index.css";
import "@rainbow-me/rainbowkit/styles.css";

import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import {
  canisterId,
  idlFactory,
} from "../../declarations/react_demo_backend/index";
import { chains, wagmiConfig } from "./wagmi/wagmi.config.ts";

import { ActorProvider } from "./ic/ActorProvider.tsx";
import App from "./App.tsx";
import AuthGuard from "./AuthGuard.tsx";
import { IdentityProvider } from "./ic/IdentityProvider.tsx";
import React from "react";
import ReactDOM from "react-dom/client";
import { Toaster } from "react-hot-toast";
import { WagmiConfig } from "wagmi";
import { _SERVICE } from "../../declarations/react_demo_backend/react_demo_backend.did";
import { createActorContext } from "./ic/ActorContext.tsx";
import { createUseActorHook } from "./ic/useActor.tsx";
import { ThirdwebProvider } from "@thirdweb-dev/react";
import { Sepolia } from "@thirdweb-dev/chains";


export const actorContext = createActorContext<_SERVICE>();
export const useActor = createUseActorHook<_SERVICE>();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
     <ThirdwebProvider activeChain={Sepolia} clientId="15a2bbda3b9a72506288c44c7ba167d3">
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider
        chains={chains}
        modalSize="compact"
        theme={darkTheme({
          accentColor: "#7b3fe4",
          accentColorForeground: "white",
          borderRadius: "large",
          overlayBlur: "none",
        })}
      >
        <IdentityProvider canisterId={canisterId} idlFactory={idlFactory}>
          <ActorProvider<_SERVICE>
            canisterId={canisterId}
            context={actorContext}
            idlFactory={idlFactory}
          >
            <AuthGuard>
              <App />
              <Toaster />
            </AuthGuard>
          </ActorProvider>
        </IdentityProvider>
      </RainbowKitProvider>
    </WagmiConfig>
    </ThirdwebProvider>
  </React.StrictMode>
);
