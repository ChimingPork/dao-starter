import sdk from "./1-initialize-sdk.js";

const token = sdk.getToken("0xaE506488B2ece9d4f7CABB9cC95e88f9eA34f2d7");

(async () => {
    try{
        //Log the current roles
        const allRoles = await token.roles.getAll();

        console.log("Roles that exist right now:", allRoles);

        //Revoke all the roles of deployer's wallet
        await token.roles.setAll({ admin: [], minter: [] });
        console.log("Roles after self-removal", await token.roles.getAll());
        console.log("Successfully removed roles");
    } catch (error) {
        console.error("Failed to revoke deployer's roles form DAO treasury");
    }
})();