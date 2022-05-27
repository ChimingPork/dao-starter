import { AddressZero } from "@ethersproject/constants";
import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

(async () => {
    try {
        const editionDropAddress = await sdk.deployer.deployEditionDrop({
            //The collection name
            name:"EarthDAO Membership",
            //Description for collection
            description: "A DAO to support the preservation of our planet",
            //The image that will represent the NFT
            image: readFileSync("scripts/assets/earth_token.jpg"),
            //Add the address of person who will receive proceeds from sales
            //Since there will be no charge, address is 0x0
            primary_sale_recipient: AddressZero,
        });

        //This initialization will return the address of our contract
        //This is used to initialize the contract on the thirdweb sdk
        const editionDrop = sdk.getEditionDrop(editionDropAddress);

        //Get the metadata of our contract
        const metadata = await editionDrop.metadata.get();

        console.log("✅ Successfully deployed editionDrop contract, address:", editionDropAddress);
        console.log("✅ editionDrop metadata:", metadata);
    } catch (error) {
        console.log("failed to deploy editionDrop contract", error);
    }
})();