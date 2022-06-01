import sdk from "./1-initialize-sdk.js";

//Get Governance contract
const vote = sdk.getVote("0x9fd4a6875c1354BfA52c23b30121930c3DE858FD");

//Get ERC-20 Governance Token Contract
const token = sdk.getToken("0xaE506488B2ece9d4f7CABB9cC95e88f9eA34f2d7");

(async () => {
    try {
        //Give treasury the ability to mint more tokens if needed.
        await token.roles.grant("minter", vote.getAddress());

        console.log("Successfully gave vote contract permission to act on token contract");
    } catch (error) {
        console.error("Failed to grant vote contract permissions on token contract");
        process.exit(1);
    }

    try {
        //Grab wallet address (deployer's) where supply currently sits
        const ownedTokenBalance = await token.balanceOf(
            process.env.WALLET_ADDRESS
        );

        //Grab 90% (or whatever is desired) of supply that is held
        const ownedAmount = ownedTokenBalance.displayValue;
        const percent90 = Number(ownedAmount) / 100 * 90;

        //Transfer this amount of the supply to the voting contract
        await token.transfer(
            vote.getAddress(),
            percent90
        );

        console.log("✅ Successfully transferred " + percent90 + " tokens to vote contract. Address:", vote);
    } catch (err) {
        console.error("Failed to transfer tokens to vote contract", err);
    }
})();