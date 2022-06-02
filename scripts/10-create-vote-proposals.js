import sdk from "./1-initialize-sdk.js";
import { ethers } from "ethers";

//Get Governance contract
const vote = sdk.getVote("0x9fd4a6875c1354BfA52c23b30121930c3DE858FD");

//Get ERC-20 Governance Token Contract
const token = sdk.getToken("0xaE506488B2ece9d4f7CABB9cC95e88f9eA34f2d7");

(async () => {
    try {
        //Create proposal to mint 420,000 new token to the treasury.
        const amount = 420_000;
        const description = "Should the DAO mint an additional " + amount + " tokens into the treasury?";
        const executions = [
            {
                //Our token contract that executes the mint.
                toAddress: token.getAddress(),
                //This nativeToken is ETH. nativeTokenValue is the amount of ETH we want to send in this proposal
                //We're minting tokens to the treasury so we want to send 0 ETH
                nativeTokenValue: 0,
                //Minting will be by vote contract, which acts as treasury
                //Using ethers.js to convert the amount to the correct format (wei is required)
                transactionData: token.encoder.encode(
                    "mintTo", [
                        vote.getAddress(),
                        ethers.utils.parseUnits(amount.toString(), 18),
                    ]
                ),
            }
        ];

        await vote.propose(description, executions);

        console.log("Successfully created proposal to mint tokens");
    } catch (error) {
        console.error("failed to create first proposal", error);
        process.exit(1);
    }

    try {
        //Create proposal to transfer deployer 7,000 tokens for doing all this work!
        const amount = 7_000
        const description = "Should the DAO transfer " + amount + " tokens from treasury to" + process.env.WALLET_ADDRESS + " for doing all this work?";
        const executions = [
            {
                //Again, sending 0 ETH, just governance token
                nativeTokenValue: 0,
                transactionData: token.encoder.encode(
                //transfer from treasury to deployer wallet
                "transfer",
                [
                    process.env.WALLET_ADDRESS,
                    ethers.utils.parseUnits(amount.toString(), 18),
                ]
            ),
            toAddress: token.getAddress(),
        },
    ];

    await vote.propose(description, executions);

    console.log("✅ Successfully created proposal to send reward from the treasury");
    } catch (error) {
        console.error("failed to create second proposal", error);
    }
})();