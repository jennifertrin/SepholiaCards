import { useAccount, useNetwork } from "wagmi";

import AddressPill from "../AddressPill";
import Button from "../ui/Button";
import ConnectButton from "./ConnectButton";
import LoginButton from "./LoginButton";
import { faWaveSquare } from "@fortawesome/free-solid-svg-icons";
import { isChainIdSupported } from "../../wagmi/is-chain-id-supported";
import NftMint from "../nft-mint/NftMint";

export default function LoginPage(): React.ReactElement {
  const { isConnected, address } = useAccount();
  const { chain } = useNetwork();

  return (
    <div className="flex flex-col w-full min-h-screen gap-4 items-center bg-white">
      <div className="flex flex-col gap-5 w-full mx-auto max-w-5xl items-center justify-center ">
        <div className="flex flex-row w-full max-w-xl border-zinc-700/50 border-[1px] bg-zinc-400 px-12 drop-shadow-xl rounded-3xl flex flex-col items-center mt-8">
          <div className="flex flex-row items-center w-full gap-10 p-8">
            <div className="flex items-center justify-center w-full gap-5">
              <div className="flex items-center justify-center w-8 h-8 text-xl font-bold rounded-full bg-zinc-300 text-zinc-800">
                1
              </div>
              <div>
                {!isConnected && <ConnectButton />}
                {isConnected && isChainIdSupported(chain?.id) && (
                  <AddressPill
                    address={address}
                  />
                )}
                {isConnected && !isChainIdSupported(chain?.id) && (
                  <Button disabled icon={faWaveSquare} variant="outline">
                    Unsupported Network
                  </Button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-center w-full gap-5">
              <div className="flex items-center justify-center w-8 h-8 text-xl font-bold rounded-full bg-zinc-300 text-zinc-800">
                2
              </div>
              <div>
                {" "}
                <LoginButton />
              </div>
            </div>
          </div>
        </div>
        <div>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <h1 className="flex text-3xl font-bold text-black text-center m-auto">
          Send an NFT card
        </h1>
        <NftMint />
      </div>
    </div>
  );
}