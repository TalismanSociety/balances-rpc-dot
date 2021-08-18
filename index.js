const types = require('@polkadot/types');
const registry = new types.TypeRegistry();
const util_crypto = require('@polkadot/util-crypto');
const keyring = require('@polkadot/keyring');
const address = "5ENpP27BrVdJTdUfY6djmcw3d3xEJ6NzSUU52CCPmGpMrdEY";
const request = require('request');

async function main() {
    const systemHash = util_crypto.xxhashAsHex("System", 128);
    const accountHash = util_crypto.xxhashAsHex("Account", 128);
    const addressBytes = keyring.decodeAddress(address);
    const hashedAddress = util_crypto.blake2AsHex(addressBytes, 128);
    // System + Account + hash_of_key + raw_key
    const combined = systemHash.replace("0x", "")
        + accountHash.replace("0x", "")
        + hashedAddress.replace("0x", "")
        + Buffer.from(addressBytes).toString('hex');
    console.log(combined)
    return new Promise((resolve, reject) => {
        request("https://westend-rpc.polkadot.io/", {
            method: "POST",
            body: JSON.stringify({
                id: 1,
                jsonrpc: "2.0",
                method: "state_getStorage",
                params: ["0x" + combined]
            }),
            headers: { "Content-Type": "application/json" }
        }, (error, response, body) => {
            if(error) reject(error);
            else resolve(response);
        });
    });
}

function decodeResult(rawBytes) {
    const accountTuple = { "AccountInfo": "(u64, u64, u64, u64, u64)" };
    const lastTypeKey = "(u64, u64, u64, u64, u64)";
    registry.register(accountTuple);
    return types.createType(registry, lastTypeKey, rawBytes);
}

main().then((result) => {
    const rawBytes = JSON.parse(result.body).result;
    console.log("raw result: ", rawBytes);
    const decoded = JSON.stringify(decodeResult(rawBytes));
    console.log("decoded: ", JSON.stringify(decoded));
    const decodedArray = decoded.replace("[", "").replace("]", "").split(",");
    const definitions = {
        "nonce": decodedArray[0],
        "index": decodedArray[1],
        "balanceHex": decodedArray[2],
        "locked": decodedArray[3],
        "reserved": decodedArray[4]
    }
    console.log(definitions);
}).catch((err) => {
    console.error(err);
})