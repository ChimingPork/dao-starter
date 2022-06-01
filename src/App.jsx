import { useAddress, useMetamask, useEditionDrop, useToken } from '@thirdweb-dev/react';
import { useState, useEffect, useMemo } from 'react';


const App = () => {
  //Use hooks given by thirdweb
  const address = useAddress();
  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);
  //Initialize editionDrop Contract
  const editionDrop = useEditionDrop("0x2c721960966fDD2a0a42e80Ab1100bB253044330");
  //Initialize the DAO token
  const token = useToken("0xaE506488B2ece9d4f7CABB9cC95e88f9eA34f2d7");
  //State variable for us to know if user has claimed NFT.
  const [hasClaimedNFT, setHasClaimedNFT] = useState(false);
  //isClaiming lets us easily keep a loading state while the NFT is minting
  const [isClaiming, setIsClaiming] = useState(false);
  //Holds the amount of tokens each member has in a state
  const [memberTokenAmounts, setMemberTokenAmounts] = useState([]);
  // The array holding all member addresses
  const [memberAddresses, setMemberAddresses] = useState([]);

  //A function used to shorten some wallet addresses for displaying
  const shortenAddress = (str) => {
    return str.substring(0, 6) + "..." + str.substring(str.length - 4);
  };

  //This useEffect grabs addresses of everyone holding a membership NFT
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    //Just like for airdrop, grab users who hold NFT with tokenID 0
    const getAllAddresses = async () => {
      try{
        const memberAddresses = await editionDrop.history.getAllClaimerAddresses(0);
        setMemberAddresses(memberAddresses);
        console.log("Member Addresses:", memberAddresses);
      } catch (error) {
        console.error("Failed to get member list", error);
      }
    };
    getAllAddresses();
  }, [hasClaimedNFT, editionDrop.history]);

  // useEffect again to grab the # of gov. tokens each member holds
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

    const getAllBalances = async () => {
      try {
        const amounts = await token.history.getAllHolderBalances();
        setMemberTokenAmounts(amounts);
        console.log("🪙 Amounts:", amounts);
      } catch (error) {
        console.error("failed to get member balances", error);
      }
    };
    getAllBalances();
  }, [hasClaimedNFT, token.history]);

  //Now combine member addresses and member tokens into single Array
  const memberList = useMemo(() => {
    return memberAddresses.map((address) => {
      //Check to see if address is in memberTokenAmounts array
      //If it is, return the amount of token that user has
      //Otherwise, return 0
      const member = memberTokenAmounts?.find(({ holder }) => holder === address);

      return {
        address,
        tokenAmount: member?.balance.displayValue || "0",
      }
    });
  }, [memberAddresses, memberTokenAmounts]);

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
      <h2>Welcome Back <u>{shortenAddress(address)}</u>!</h2>
      <div>
        <div>
        <h3>Member List</h3>
        <table className="card">
          <thead>
            <tr>
              <th>Address</th>
              <th>Token Amount</th>
            </tr>
          </thead>
          <tbody>
            {memberList.map((member) => {
              return (
                <tr key={member.address}>
                  <td>{shortenAddress(member.address)}</td>
                  <td>{member.tokenAmount}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
};

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
