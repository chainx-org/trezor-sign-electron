const {getUnspents} = require("../bitcoin/bitcoin.js")
const Api = require("../chainx")

// 根据utxo 数量计算 amount
async function calNeedUtxo(count) {
    const bitcoinType = "mainnet";
    let unspents_result = []

    try {
        const info = await Api.getInstance().getTrusteeSessionInfo(0);
        const hotAddr = String(info.hotAddress.addr);
        let unspents = await getUnspents(hotAddr, bitcoinType);
        unspents.sort((a, b) => {
            return b.amount - a.amount
        });
        for (let i = 0, len = unspents.length; i < len; i += count) {
            unspents_result.push(unspents.slice(i, i + count));
        }
    } catch (error) {
        console.log(error)
    }
    return unspents_result
}

module.exports = {
    calNeedUtxo
}
