import Header from "./components/header/Header";
import NftMint from "./components/nft-mint/NftMint";

function App() {
  return (
    <div className="bg-white flex flex-col items-center w-full min-h-screen">
      <Header />
      <div className="flex flex-row items-center w-full gap-10 p-5">
        <div className="h-5 flex" />
        <NftMint />
      </div>
    </div>
  );
}

export default App;
