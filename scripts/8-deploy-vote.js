import sdk from "./1-initialize-sdk.js";

(async () => {
    try {
        const voteContractAddress = await sdk.deployer.deployVote({
            // Give governance contract a name
            name: "Earth Dao Governance",

            //Location of governance token (the ERC-20 token)
            //Don't want people to use different tokens to vote!
            voting_token_address: "0xaE506488B2ece9d4f7CABB9cC95e88f9eA34f2d7",

            //These parameters are specified in blocks
            // For ethereum, each block is roughly 13.14 seconds

            //After proposal is created, when can voting start?
            //Currently set to immediatelly (0 blocks)
            voting_delay_in_blocks: 0,

            //How long will members have to vote on a proposal
            //Assuming 1 day = 6575 blocks
            voting_period_in_blocks: 6575, /* 1 day */

            //Minimum % of total supply needed to vote for proposal for it to be valid
            voting_quorum_fraction: 33,

            //The minimum number of tokens needed for members to create a proposal
            //0 would mean users who own membership NFTs but no tokens can make proposals
            proposal_token_threshold: 0,
        });
        console.log("✅ Successfully deployed vote contract, address:", voteContractAddress);
    } catch (err) {
        console.error("Failed to deploy vote contract", err);
    }
})();