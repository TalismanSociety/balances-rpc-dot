const AccountInfo = require("../util/AccountInfo");
const { expect } = require("chai")

describe("AccountInfo functionality", () => {

    it("should be able to get a native balances object", async () => {
        const accountInfo = new AccountInfo(
            "5ENpP27BrVdJTdUfY6djmcw3d3xEJ6NzSUU52CCPmGpMrdEY",
            "https://westend-rpc.polkadot.io/"
        );
        const accountNativeBalances = await accountInfo.getAccountInfo();
        const keys = Object.keys(accountNativeBalances);
        expect(keys[0] === "nonce", "should have a nonce field");
        expect(keys[1] === "index", "should have a index field");
        expect(keys[2] === "freeBalance", "should have a freeBalance field");
        expect(keys[3] === "locked", "should have a locked field");
        expect(keys[4] === "reserved", "should have a reserved field");
    });

});