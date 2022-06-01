import sdk from "./1-initialize-sdk.js";

//This is the address to our ERC-1155 membership NFT contract.
const editionDrop = sdk.getEditionDrop("0x2c721960966fDD2a0a42e80Ab1100bB253044330");

//This is the address to our ERC-20 token contract
const token = sdk.getToken("0xaE506488B2ece9d4f7CABB9cC95e88f9eA34f2d7");

(async () => {
    try {
        //Get all the addresses of people who own a membership NFT
        //Remember, these have a tokenID of 0
        const walletAddresses = await editionDrop.history.getAllClaimerAddresses(0);

        if (walletAddresses.length === 0) {
            console.log("No NFTs have been claimed yet");
            process.exit(0);
        }

        //Loop through array of addresses
        const airdropTargets = walletAddresses.map((address) => {
            // Decide airdrop amount. This option picks a random # between 1000 and 10000
            const randomAmount = Math.floor(Math.random() * (10000 - 1000 + 1) + 1000);
            console.log("🪂Going to airdrop", randomAmount, "tokens to", address);

            //Set up the target
            const airdropTarget = {
                toAddress: address,
                amount: randomAmount,
            };

            return airdropTarget;
        });

        //Call transferBatch on all airdrop targets
        console.log("Starting airdrop...");
        await token.transferBatch(airdropTargets);
        console.log("✅ Successfully airdropped tokens to all the holders of the NFT");
    } catch (err) {
        console.error("Failed to airdrop tokens", err)
    }
})();