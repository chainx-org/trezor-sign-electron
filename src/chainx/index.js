const { ApiPromise, WsProvider, Keyring } = require("@polkadot/api")
const { options } = require("@chainx-v2/api")

class Api {
    api = null;
    provider = null;

    constructor() {
        const wsProvider = new WsProvider("wss://mainnet.chainx.org/ws");
        this.api = new ApiPromise(options({ provider: wsProvider }));
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

    async getTrusteeSessionInfo() {
        await this.ready()
        // @ts-ignore
        const bitcoinTrusteeSessionInfo = await this.api.rpc.xgatewaycommon.bitcoinTrusteeSessionInfo();
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