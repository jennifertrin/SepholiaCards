import { useState, useEffect } from "react";
import { useContract, useConnect, useClaimNFT, metamaskWallet } from "@thirdweb-dev/react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { Sepolia } from "@thirdweb-dev/chains";
import { providers } from 'ethers'
import TokenGating from "../token_gating/TokenGating";

export default function NftMint() {
    const [sentAddress, setSendAddress] = useState<string>("");
    const [newSigner, setNewSigner] = useState<providers.JsonRpcSigner | undefined>();
    const [buttonLoad, setButtonLoad] = useState<boolean>(false);
    const [sendButtonSuccess, setSendButtonSuccess] = useState<boolean>(false);

    const contractAddress = "0x3BE725676aB26e1C47076C8438E3daFBB08d486B";
    const { contract: HolidayCards } = useContract(contractAddress);
    const { mutateAsync: claimNFT } = useClaimNFT(HolidayCards);

    const metamaskConfig = metamaskWallet();
    const connect = useConnect();


    useEffect(() => {
        async function initializeSDK() {
            const signer = await getSigner();
            if (signer) {
                setNewSigner(signer);
            }
        }

        initializeSDK();
    }, []);

    async function getSigner() {
        const provider = new providers.Web3Provider(window.ethereum);
        const [address] = await provider.listAccounts();
        return provider.getSigner(address);
    }

    return (
        <div className="w-full flex flex-col gap-6">
            <img className="object-contain max-h-96 mx-auto" src="/image.jpg" />
            <div>
                <div className="md:flex items-center block mx-auto gap-2">
                    <div className="md:w-1/4 xl:ml-12 flex">
                        <label className="block font-bold md:text-right mb-1 md:mb-0 pr-4">
                            To wallet address:
                        </label>
                    </div>
                    <div className="flex md:w-3/4">
                        <input className="appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="send-wallet-address" type="text" placeholder="Ethereum wallet address starting with 0x..." onChange={event => setSendAddress(event.target.value)} />
                    </div>
                </div>
            </div>
            {sendButtonSuccess ? <p className="text-sm ...">The Card was sent!</p> : null}
            <div className="flex mb-5">
                <TokenGating />
            </div>
            <button
                className="block w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-4 mx-auto my-10 rounded-xl disabled:bg-slate-200"
                disabled={!sentAddress || sentAddress === ''}
                onClick={async () => {
                    setButtonLoad(true);
                    setSendButtonSuccess(false);
                    await connect(metamaskConfig);
                    if (newSigner) {
                        await ThirdwebSDK.fromSigner(newSigner, Sepolia, {
                            clientId: "15a2bbda3b9a72506288c44c7ba167d3",
                        });
                    }
                    await claimNFT({
                        to: sentAddress,
                        quantity: 1,
                        tokenId: 0,
                    })
                    setSendButtonSuccess(true);
                    setButtonLoad(false);
                }}
            >
                {buttonLoad ? "Card Sending": "Send Card"}
            </button>
        </div>
    );
}
