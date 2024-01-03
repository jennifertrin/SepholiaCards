import Header from "./components/header/Header";
import NftMint from "./components/nft-mint/NftMint";

function App() {
  return (
    <div className="bg-white flex flex-col items-center w-full min-h-screen">
      <Header />
      <div className="flex flex-col items-center w-1/2 gap-10 p-5">
        <div className="h-5" />
        <NftMint />
      </div>
    </div>
  );
}

export default App;
