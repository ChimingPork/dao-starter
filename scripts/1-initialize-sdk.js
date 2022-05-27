import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { ethers } from "ethers";

//import .env file to seculry store environment variables
import dotenv from "dotenv";
dotenv.config();

//check to make sure .env works
if (!process.env.PRIVATE_KEY || process.env.PRIVATE_KEY === "") {
    console.log ("🛑 Private key not found.")
}

if (!process.env.ALCHEMY_API_URL || process.env.ALCHEMY_API_URL === "") {
    console.log("🛑 API URL not found.")
}

if (!process.env.WALLET_ADDRESS || process.env.WALLET_ADDRESS === "") {
    console.log("🛑 Wallet Address not found.")
}

//Remote Procedure Call (RPC) URL, grab API URL from .env
const provider = new ethers.providers.JsonRpcProvider(process.env.ALCHEMY_API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const sdk = new ThirdwebSDK(wallet);

(async () => {
    try {
        const address = await sdk.getSigner().getAddress();
        console.log("SDK initialized by address:", address)
    } catch (err) {
        console.error("Failed to get apps from the sdk", err);
        process.exit(1);
    }
})();

//Export initialized thirdweb SDK so that it can be used in other scripts
export default sdk;