const types = require('@polkadot/types');
const registry = new types.TypeRegistry();
const util_crypto = require('@polkadot/util-crypto');
const keyring = require('@polkadot/keyring');
const request = require('request');
const systemHash = "26aa394eea5630e07c48ae0c9558cef7"; //util_crypto.xxhashAsHex("System", 128);
const accountHash = "b99d880ec681799c0cf30e8886371da9"; //util_crypto.xxhashAsHex("Account", 128);
const accountTuple = { "AccountInfo": "(u64, u64, u64, u64, u64)" };
registry.register(accountTuple);

module.exports = class AccountInfo {

    constructor(address, endpoint) {
        this.endpoint = endpoint;
        this.address = address;
        this.addressBytes = keyring.decodeAddress(address);
        this.hashedAddress = util_crypto.blake2AsHex(this.addressBytes, 128).replace("0x", "");
        this.addressHex = Buffer.from(this.addressBytes).toString('hex');
    }

    /*
    * @dev gets the native account information for a particular address
    * @returns an object containing the nonce, index, freeBalance, locked & reserved info
    * */
    async getAccountInfo() {
        const payload = "0x" + systemHash + accountHash + this.hashedAddress + this.addressHex;
        const rawBytes = await this.getCallRPC("state_getStorage", [payload]);
        const decoded = JSON.stringify(this.decodeResult(rawBytes));
        const decodedArray = JSON.parse(decoded);
        return {
            "nonce": decodedArray[0],
            "index": decodedArray[1],
            "freeBalance": decodedArray[2],
            "locked": decodedArray[3],
            "reserved": decodedArray[4]
        }
    }

    /*
    * @dev gets the asset account information for a particular address and asset
    * @param assetId - the id of the asset, see examples here: https://wiki.sora.org/polkaswap/tokens-id-addresses
    * @returns an object containing the balance
    * */
    async getAssetAccountInfo(assetId) {
        const params = [this.address, assetId];
        return this.getCallRPC("assets_freeBalance", params);
    }

    /*
    * @dev calls RPC node
    * @param method - the RPC method
    * @param params - the parameter payload to the RPC call
    * @returns raw result from the node
    * */
    async getCallRPC(method, params) {
        return new Promise((resolve, reject) => {
            request(this.endpoint, {
                method: "POST",
                body: JSON.stringify({
                    id: 1,
                    jsonrpc: "2.0",
                    method: method,
                    params: params
                }),
                headers: { "Content-Type": "application/json" }
            }, (error, response, body) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(JSON.parse(response.body).result);
                }
            });
        });
    }

    /*
    * @dev parses the raw bytes returned via RPC into readable information
    * @returns a decoded object
    * */
    decodeResult(rawBytes) {
        return types.createType(registry, accountTuple.AccountInfo, rawBytes);
    }

}