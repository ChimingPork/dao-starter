import sdk from "./1-initialize-sdk.js";

//This is the address of our ERC-20 contract
const token = sdk.getToken("0xaE506488B2ece9d4f7CABB9cC95e88f9eA34f2d7");

(async () => {
    try {
        //What's the max supply?
        const amount = 1000000;
        //Interact with deployed contract and mint the tokens
        await token.mintToSelf(amount);
        const totalSupply = await token.totalSupply();

        //Print out how many token's now in circulation
        console.log("There is", totalSupply.displayValue, "$EARTH in circulation");
    } catch (error) {
        console.error("Failed to mint ERC-20", error);
    }
})();