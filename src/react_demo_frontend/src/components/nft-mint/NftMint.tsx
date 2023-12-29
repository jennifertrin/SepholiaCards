import { useState } from "react";
import { useContract, useClaimNFT } from "@thirdweb-dev/react";


export default function NftMint() {
    const [sentAddress, setSendAddress] = useState<string>("");
    const contractAddress = "0x3BE725676aB26e1C47076C8438E3daFBB08d486B";
    const { contract: HolidayCards } = useContract(contractAddress);
    const { mutateAsync: claimNFT } = useClaimNFT(HolidayCards);

    return (
            <div className="w-full border border-10 rounded-xl">
                <img className="object-cover h-96 rounded-xl" src="/image.jpg" />
                <div className="md:flex md:items-center mb-6 mt-8 px-6">
                    <div className="md:w-1/3">
                        <label className="block text-gray-500 font-bold md:text-right mb-1 md:mb-0 pr-4">
                            To wallet address:
                        </label>
                    </div>
                    <div className="md:w-2/3">
                        <input className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-purple-500" id="send-wallet-address" type="text" placeholder="Ethereum wallet address starting with 0x..." onChange={event => setSendAddress(event.target.value)} />
                    </div>
                </div>
            <button className="block w-1/2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-4 mx-auto my-10 rounded-xl disabled:bg-slate-200" disabled={!sentAddress || sentAddress == ''}
                onClick={() =>
                    claimNFT({
                        to: sentAddress,
                        quantity: 1,
                    })
                }
            >
                Send Card
            </button>
        </div>
    );
}
