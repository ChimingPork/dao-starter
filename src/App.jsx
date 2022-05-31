import { useAddress, useMetamask, useEditionDrop } from '@thirdweb-dev/react';
import { useState, useEffect } from 'react';


const App = () => {
  //Use hooks given by thirdweb
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);
  //Initialize editionDrop Contract
  const editionDrop = useEditionDrop("0x2c721960966fDD2a0a42e80Ab1100bB253044330");
  //State variable for us to know if user has claimed NFT.
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  //isClaiming lets us easily keep a loading state while the NFT is minting
  const [isClaiming, setIsClaiming] = useState(false);

  useEffect(() => {
    //Exit if they don't have a wallet! (Go to connect wallet dashboard)
    if (!address) {
      return;
  }

  const checkBalance = async () => {
    try {
      //Query contract for data, check if address has a token with ID 0
      const balance = await editionDrop.balanceOf(address, 0);
      if (balance.gt(0)) {
        setHasClaimedNFT(true);
        console.log("This user has a membership NFT!");
      } else {
        setHasClaimedNFT(false);
        console.log("This user doesn't have a membership NFT");
      }
    } catch (error) {
      setHasClaimedNFT(false);
      console.error("failed to get balance", error);
    }
  };
    checkBalance();
}, [address, editionDrop]);

const mintNft = async () => {
  try {
    setIsClaiming(true);
    await editionDrop.claim("0", 1);
    console.log(`👍 Successfully Minted! Check it out on Opensea: https://testnets.opensea.io/assets/goerli/${editionDrop.getAddress()}/0`)
    setHasClaimedNFT(true);
  } catch (error) {
    setHasClaimedNFT(false);
    console.error("Failed to mint NFT", error);
  } finally {
    setIsClaiming(false);
  }
};

  // If no wallet is connected, add a button to call connectWallet
  if (!address) {
  return (
    <div className="landing">
      <h1>Welcome to 🌎EarthDAO</h1>
      <button onClick={connectWithMetamask} className="btn-hero">
        Connect your wallet
      </button>
    </div>
  );
};

//DAO Dashboard for people with a membership NFT
if (hasClaimedNFT) {
  return (
    <div className="member-page">
      <h1>🌎EarthDAO Member Dashboard</h1>
      <h2>Welcome Back <u>{address}</u>!</h2>
    </div>
  )
}

//If wallet is connected, render mint NFT screen
return (
  <div className="mint-nft">
    <h1>Mint your FREE 🌎EarthDAO Membership NFT</h1>
    <button disabled={isClaiming} onClick={mintNft}>
      {isClaiming ? "Minting..." : "Mint your NFT (Free!)"}
    </button>
  </div>
  );
}

export default App;
