import { useAddress, useMetamask, useEditionDrop, useToken, useVote, useNetwork } from '@thirdweb-dev/react';
import { ChainId } from '@thirdweb-dev/sdk';
import { useState, useEffect, useMemo } from 'react';
import { AddressZero } from "@ethersproject/constants";

const App = () => {
  //Use hooks given by thirdweb
  const address = useAddress();
  const network = useNetwork();
  const connectWithMetamask = useMetamask();
  console.log("👋 Address:", address);
  //Initialize editionDrop Contract
  const editionDrop = useEditionDrop("0x2c721960966fDD2a0a42e80Ab1100bB253044330");
  //Initialize the DAO token
  const token = useToken("0xaE506488B2ece9d4f7CABB9cC95e88f9eA34f2d7");
  //Initialize the Governance voting contract
  const vote = useVote("0x9fd4a6875c1354BfA52c23b30121930c3DE858FD");
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

  //Set proposal/voting states
  const [proposals, setProposals] = useState([]);
  const [activeProposals, setActiveProposals] = useState([]);
  const [defeatedProposals, setDefeatedProposals] = useState([]);
  const [successfulProposals, setSuccessfulProposals] = useState([]);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  //Retrive all proposals from contract
  useEffect(() => {
    if (!hasClaimedNFT) {
      return;
    }

  //Call vote.getAll() to grap the proposals
    const getAllProposals = async () => {
      try {
        const proposals = await vote.getAll();
        setProposals(proposals);
        console.log("🌈 Proposals:", proposals)

        let i = 0; 
        const activeProposals = [];
        const defeatedProposals = [];
        const successfulProposals = [];
        while (i < proposals.length) {
          if (proposals[i].state === 1) {
          activeProposals.push(proposals[i]);
          } 
          
          else if (proposals[i].state === 3) {
            defeatedProposals.push(proposals[i]);
          }

          else if (proposals[i].state === 4) {
            successfulProposals.push(proposals[i]);
          }
          i++;
        }
        setActiveProposals(activeProposals);
        setDefeatedProposals(defeatedProposals);
        setSuccessfulProposals(successfulProposals);
        console.log("🌈 Active Proposals:", activeProposals);
        console.log("❌ Defeated Proposals:", defeatedProposals);
        console.log("✅ Successful Proposals:", successfulProposals)
  
      } catch (error) {
        console.log("failed to get proposals", error);
      }
    };
    getAllProposals();
  }, [hasClaimedNFT, vote]);

//Check if user already voted
useEffect(() => {
  if (!hasClaimedNFT) {
    return;
  }

  //If there are no proposals we can't check for votes
  if (!proposals.length) {
    return;
  }
  
  const checkIfUserHasVoted = async () => {
    try {
      const hasVoted = await vote.hasVoted(proposals[0].proposalId, address);
      setHasVoted(hasVoted);
      if (hasVoted) {
        console.log("User has already voted")
      } else {
        console.log("User has not voted yet")
      }
    } catch (error) {
      console.error("Failed to check if wallet has voted", error)
    }
  };
  checkIfUserHasVoted();
}, [hasClaimedNFT, proposals, address, vote])

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

if (address && (network?.[0].data.chain.id !== ChainId.Goerli)) {
  return (
    <div className="unsupported-network">
      <h2>Please connect to Goerli</h2>
      <p>
        This dapp only works on the Goerli network, please switch networks
        in your connected wallet.
      </p>
    </div>
  );
}

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
      <h1>🌎Earth DAO Member Page</h1>
      <h2>Welcome Back {shortenAddress(address)}!</h2>
      <div>
        <div>
          <h2><u>Earthlings</u></h2>
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
          <h2><u>Successful Proposals</u></h2>
          <form>
            {successfulProposals.map((proposal) => (
              <div key={proposal.proposalId} className="card">
                <h5>{proposal.description}</h5>
                <h5><u>Vote Results</u></h5>
                <div className="result">
                <h5> For: {parseInt(proposal.votes[1].count)} </h5>
                <h5> Against: {parseInt(proposal.votes[0].count)} </h5>
                <h5> Abstain: {parseInt(proposal.votes[2].count)} </h5>
                </div>
              </div>
            ))}
            </form>
          <h2><u>Defeated Proposals</u></h2>
            <form>
            {defeatedProposals.map((proposal) => (
              <div key={proposal.proposalId} className="card">
                <h5>{proposal.description}</h5>
                <h5><u>Vote Results</u></h5>
                <div className="result">
                <h5>For: {parseInt(proposal.votes[1].count)} </h5>
                <h5>Against: {parseInt(proposal.votes[0].count)} </h5>
                <h5>Abstain: {parseInt(proposal.votes[2].count)} </h5>
                </div>
              </div>
            ))}
            </form>
        </div>
        <div>
          <h2><u>Active Proposals</u></h2>
          <form
              onSubmit={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                //before we do async things, we want to disable the button to prevent double clicks
                setIsVoting(true);

                // lets get the votes from the form for the values
                const votes = activeProposals.map((proposal) => {
                  const voteResult = {
                    proposalId: proposal.proposalId,
                    //abstain by default
                    vote: 2,
                  };
                  proposal.votes.forEach((vote) => {
                    const elem = document.getElementById(
                      proposal.proposalId + "-" + vote.type
                    );

                    if (elem.checked) {
                      voteResult.vote = vote.type;
                      return;
                    }
                  });
                  return voteResult;
                });

                // first we need to make sure the user delegates their token to vote
                try {
                  //we'll check if the wallet still needs to delegate their tokens before they can vote
                  const delegation = await token.getDelegationOf(address);
                  // if the delegation is the 0x0 address that means they have not delegated their governance tokens yet
                  if (delegation === AddressZero) {
                    //if they haven't delegated their tokens yet, we'll have them delegate them before voting
                    await token.delegateTo(address);
                  }
                  // then we need to vote on the proposals
                  try {
                    await Promise.all(
                      votes.map(async ({ proposalId, vote: _vote }) => {
                        // before voting we first need to check whether the proposal is open for voting
                        // we first need to get the latest state of the proposal
                        const proposal = await vote.get(proposalId);
                        // then we check if the proposal is open for voting (state === 1 means it is open)
                        if (proposal.state === 1) {
                          // if it is open for voting, we'll vote on it
                          return vote.vote(proposalId, _vote);
                        }
                        // if the proposal is not open for voting we just return nothing, letting us continue
                        return;
                      })
                    );
                    try {
                      // if any of the propsals are ready to be executed we'll need to execute them
                      // a proposal is ready to be executed if it is in state 4
                      await Promise.all(
                        votes.map(async ({ proposalId }) => {
                          // we'll first get the latest state of the proposal again, since we may have just voted before
                          const proposal = await vote.get(proposalId);

                          //if the state is in state 4 (meaning that it is ready to be executed), we'll execute the proposal
                          if (proposal.state === 4) {
                            return vote.execute(proposalId);
                          }
                        })
                      );
                      // if we get here that means we successfully voted, so let's set the "hasVoted" state to true
                      setHasVoted(true);
                      // and log out a success message
                      console.log("successfully voted");
                    } catch (err) {
                      console.error("failed to execute votes", err);
                    }
                  } catch (err) {
                    console.error("failed to vote", err);
                  }
                } catch (err) {
                  console.error("failed to delegate tokens");
                } finally {
                  // in *either* case we need to set the isVoting state to false to enable the button again
                  setIsVoting(false);
                }
              }}
            >
            {activeProposals.map((proposal) => (
              <div key={proposal.proposalId} className="card">
                <h5>{proposal.description}</h5>
                <h5 className="sub">Vote Open: Block {parseInt(proposal.startBlock)}</h5>
                <h5 className="sub">Voting Close: Block {parseInt(proposal.endBlock)} </h5>
                <div>
                  {proposal.votes.map(({ type, label }) => (
                    <div key={type}>
                      <input
                        type="radio"
                        id={proposal.proposalId + "-" + type}
                        name={proposal.proposalId}
                        value={type}
                        //default the "abstain" vote to checked
                        defaultChecked={type === 2}
                      />
                      <label htmlFor={proposal.proposalId + "-" + type}>
                        {label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button disabled={isVoting || hasVoted} type="submit">
              {isVoting
                ? "Voting..."
                : hasVoted
                  ? "You Already Voted"
                  : "Submit Votes"}
            </button>
            {!hasVoted && (
              <small>
                This will trigger multiple transactions that you will need to
                sign.
              </small>
            )}
          </form>
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