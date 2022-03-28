const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api")
const fs = require('fs');
const rpcFile = JSON.parse(fs.readFileSync('./src/res/rpc.json').toString());
const typeFile = JSON.parse(fs.readFileSync('./src/res/types.json').toString());

class Api {
    api = null;
    provider = null;

    constructor() {
        const wsProvider = new WsProvider("wss://mainnet.chainx.org/ws");
        this.api = new ApiPromise({ rpc: rpcFile, types: typeFile, provider: wsProvider });
    }

    static getInstance() {
        if (!Api.instance) {
            Api.instance = new Api();
        }

        return Api.instance;
    }

    async ready() {
        await this.api.isReady;
    }

    async getTrusteeSessionInfo(session_number) {
        await this.ready()
        // @ts-ignore
        const bitcoinTrusteeSessionInfo = await this.api.rpc.xgatewaycommon.bitcoinTrusteeSessionInfo(session_number);
        return bitcoinTrusteeSessionInfo
    }

    async getChainProperties() {
         return {
             ss58Format: 44,
             bitcoinType: "mainnet",
             tokenDecimals:18,
             tokenSymbol:'PCX'
         };
     }

}

module.exports = Api
