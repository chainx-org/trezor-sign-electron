const { getUnspents, calcTargetUnspents } = require("../bitcoin/bitcoin.js")
const Api = require("../chainx")

// 根据utxo 数量计算 amount
async function calNeedUtxo(count){
    const bitcoinType = "mainnet";
    const info = await Api.getInstance().getTrusteeSessionInfo();
    const hotAddr = String(info.hotAddress.addr);
    const unspents = await getUnspents(hotAddr, bitcoinType);
    unspents.sort((a, b) => {
            return b.amount > a.amount
    });
    const unspentsLimit = []
    let utxoCalamount = 0;
    console.log(`utxo ${JSON.stringify(unspents[0])}`)

    // 如果 count 大于 当前utxo 数量，则使用当前 utxo， 否则使用 count 个 utxo
    const needCount = unspents.length < count ? unspents.length : count;

    for (let i = 0; i < needCount; i ++) {
        unspentsLimit.push(unspents[i])
        utxoCalamount += unspents[i].amount
    }
    // 返回count个utxto的总金额
    return utxoCalamount / Math.pow(10, 8)
}

module.exports = {
    calNeedUtxo
}