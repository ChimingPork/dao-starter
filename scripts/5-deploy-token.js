import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";

(async () => {
    try {
        //Deploy a standard ERC-20 contract
        const tokenAddress = await sdk.deployer.deployToken({
            //What's the tokens name?
            name: "EarthDAO Governance Token",
            //What's the token's symbol?
            symbol: "EARTH",
            //This line is for if we want to sell the token
            //Because we don't, we set to AddressZero
            primary_sale_recipient: AddressZero,
        });
        console.log("👍 successfully deployed token module, address:", tokenAddress);
    } catch (error) {
        console.error("Failed to deploy token module", error);
    }
})();