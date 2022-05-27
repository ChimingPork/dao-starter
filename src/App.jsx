import { useAddress, useMetamask } from '@thirdweb-dev/react';


const App = () => {
  //Use hooks given by thirdweb
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);

  // If no wallet is connected, add a button to call connectWallet
  if (!address) {
  return (
    <div className="landing">
      <h1>Welcome to EARTH DAO</h1>
      <button onClick={connectWithMetamask} className="btn-hero">
        Connect your wallet
      </button>
    </div>
  );
};

//If wallet is connected, return this page instead
return (
  <div className="landing">
    <h1>Wallet connected!</h1>
  </div>
)
}

export default App;
