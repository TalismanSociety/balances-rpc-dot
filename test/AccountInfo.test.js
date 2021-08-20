const AccountInfo = require("../util/AccountInfo");
const { expect } = require("chai")

describe("AccountInfo functionality", () => {

    it("should be able to get a native balances object", async () => {
        const accountInfo = new AccountInfo(
            "5ENpP27BrVdJTdUfY6djmcw3d3xEJ6NzSUU52CCPmGpMrdEY",
            "https://westend-rpc.polkadot.io/"
        );
        const accountNativeBalances = await accountInfo.getAccountBalanceInfo();
        const keys = Object.keys(accountNativeBalances);
        expect(keys[0] === "nonce", "should have a nonce field");
        expect(keys[1] === "index", "should have a index field");
        expect(keys[2] === "freeBalance", "should have a freeBalance field");
        expect(keys[3] === "locked", "should have a locked field");
        expect(keys[4] === "reserved", "should have a reserved field");
    });

    it("should be able to get an asset account balance", async () => {
        const accountInfo = new AccountInfo(
            "cnWJAqJZ9KrEbBFupqrtTHHZtfbriyJptFmh9cAjEteR1JnZ9",
            "https://rpc.sora2.soramitsu.co.jp"
        );
        const assetBalance = await accountInfo.getAssetBalanceAccountInfo("0x0200060000000000000000000000000000000000000000000000000000000000");
        expect(assetBalance.balance).to.not.equal(undefined);
    });

    it("should be able to get an asset account balance with a different format address", async () => {
        const accountInfo = new AccountInfo(
            "5ENpP27BrVdJTdUfY6djmcw3d3xEJ6NzSUU52CCPmGpMrdEY",
            "https://rpc.sora2.soramitsu.co.jp"
        );
        const assetBalance = await accountInfo.getAssetBalanceAccountInfo("0x0200060000000000000000000000000000000000000000000000000000000000");
        expect(assetBalance.balance).to.not.equal(undefined);
    });

    it("should be able to get multiple asset balances", async () => {
        const accountInfo = new AccountInfo(
            "cnWJAqJZ9KrEbBFupqrtTHHZtfbriyJptFmh9cAjEteR1JnZ9",
            "https://rpc.sora2.soramitsu.co.jp"
        );
        const assetIds = ["0x0200060000000000000000000000000000000000000000000000000000000000",
            "0x0200070000000000000000000000000000000000000000000000000000000000"];
        const assetBalances = await accountInfo.getMultipleAssetAccountBalances(assetIds);
        expect(assetBalances.length).to.equal(2, "should return 2 balances objects");
    });

});