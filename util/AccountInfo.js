const types = require('@polkadot/types');
const registry = new types.TypeRegistry();
const util_crypto = require('@polkadot/util-crypto');
const keyring = require('@polkadot/keyring');
const request = require('request');

module.exports = class AccountInfo {

    constructor(address, endpoint) {
        this.endpoint = endpoint;
        const systemHash = util_crypto.xxhashAsHex("System", 128);
        const accountHash = util_crypto.xxhashAsHex("Account", 128);
        const addressBytes = keyring.decodeAddress(address);
        const hashedAddress = util_crypto.blake2AsHex(addressBytes, 128);
        this.payload = systemHash.replace("0x", "")
            + accountHash.replace("0x", "")
            + hashedAddress.replace("0x", "")
            + Buffer.from(addressBytes).toString('hex');
    }

    async getAccountInfo() {
        const accountInfoRaw = await this.getAccountInfoRaw();
        const rawBytes = JSON.parse(accountInfoRaw.body).result;
        const decoded = JSON.stringify(this.decodeResult(rawBytes));
        const decodedArray = decoded.replace("[", "").replace("]", "").split(",");
        return {
            "nonce": decodedArray[0],
            "index": decodedArray[1],
            "freeBalance": decodedArray[2],
            "locked": decodedArray[3],
            "reserved": decodedArray[4]
        }
    }

    async getAccountInfoRaw() {
        return new Promise((resolve, reject) => {
            request(this.endpoint, {
                method: "POST",
                body: JSON.stringify({
                    id: 1,
                    jsonrpc: "2.0",
                    method: "state_getStorage",
                    params: ["0x" + this.payload]
                }),
                headers: { "Content-Type": "application/json" }
            }, (error, response, body) => {
                if(error) reject(error);
                else resolve(response);
            });
        });
    }

    decodeResult(rawBytes) {
        const accountTuple = { "AccountInfo": "(u64, u64, u64, u64, u64)" };
        const lastTypeKey = "(u64, u64, u64, u64, u64)";
        registry.register(accountTuple);
        return types.createType(registry, lastTypeKey, rawBytes);
    }

}