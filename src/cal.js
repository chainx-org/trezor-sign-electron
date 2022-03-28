const { getUnspents, calcTargetUnspents } = require("./bitcoin/bitcoin.js")
const bitcoin = require("bitcoinjs-lib");
const Main = require("electron/main");
const Api = require("./chainx")

async function cal(){
    const bitcoinType = "mainnet";
    const info = await Api.getInstance().getTrusteeSessionInfo(0);
    const hotAddr = String(info.hotAddress.addr);
    const unspents = await getUnspents(hotAddr, bitcoinType);
    unspents.sort((a, b) => {
            return b.amount > a.amount
    });
    const unspentsLimit = []
    let utxoCalamount = 0;
    console.log(`utxo ${JSON.stringify(unspents[0])}`)

    for (let i = 0; i < 100; i ++) {
        unspentsLimit.push(unspents[i])
        utxoCalamount += unspents[i].amount
    }

    console.log(`转账的 utxoCalamount: ${utxoCalamount / Math.pow(10, 8)}`)

}

module.exports = {
    cal
}
