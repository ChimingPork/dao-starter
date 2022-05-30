import sdk from "./1-initialize-sdk.js";
import { MaxUint256 } from "@ethersproject/constants";

const editionDrop = sdk.getEditionDrop("0x2c721960966fDD2a0a42e80Ab1100bB253044330");

(async () => {
    try {
        //Define claim conditions as an array of objects
        //Using an array of objects to allow for multiple phases starting at different times if desired
        const claimConditions = [{
            //When can people start claiming the NFTs? (now)
            startTime: new Date(),
            //Maximum number of NFTs that can be claimed? (Max memberships)
            maxQuantity: 10_000,
            //Price of the NFT?
            price: 0,
            //Amount that people can mint per transaction
            quantityLimitPerTransaction: 1,
            //Wait time between transactions. 
            //In this case, MaxUint256 is used so that people can only claim once
            waitInSeconds: MaxUint256,
        }]

        //This line allows interaction with deployed contract to adjust the conditions
        //Set to 0 so that everyone mints with tokenID 0
        await editionDrop.claimConditions.set("0", claimConditions);
        console.log("✅ Successfully set claim condition!");
    } catch (error) {
        console.error("Failed to set claim condition", error);
    }
 })();