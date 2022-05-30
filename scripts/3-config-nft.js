import sdk from "./1-initialize-sdk.js";
import { readFileSync } from "fs";

const editionDrop = sdk.getEditionDrop("0x2c721960966fDD2a0a42e80Ab1100bB253044330");

(async () => {
    try {
        await editionDrop.createBatch([
            {
                name: "EarthDAO Membership",
                description: "This token will give you access to EarthDAO",
                image: readFileSync("scripts/assets/earth_token.jpg"),
            },
        ]);
        console.log("successfully created a new NFT in the drop");
    } catch (error) {
        console.error("failed to create the new NFT", error);
    }
})();