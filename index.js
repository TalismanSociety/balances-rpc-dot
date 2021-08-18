const AccountInfo = require("./util/AccountInfo");

async function main() {
    const accountInfo = new AccountInfo(
        "5ENpP27BrVdJTdUfY6djmcw3d3xEJ6NzSUU52CCPmGpMrdEY",
        "https://westend-rpc.polkadot.io/"
    );
    return accountInfo.getAccountInfo();
}

main().then(console.log).catch(console.error);