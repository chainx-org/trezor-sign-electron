const {getUnspents} = require("../bitcoin/bitcoin.js")
const Api = require("../chainx")

// 根据utxo 数量计算 amount
async function calNeedUtxo(count) {
    const bitcoinType = "mainnet";
    let unspents_result = []

    try {
        const info = await Api.getInstance().getTrusteeSessionInfo(0);
        const hotAddr = String(info.hotAddress.addr);
        const unspents = await getUnspents(hotAddr, bitcoinType);
        unspents.sort((a, b) => {
            return b.amount > a.amount
        });
        let unspents_slices = []
        for (let i = 0, len = unspents.length; i < len; i += count) {
            unspents_slices.push(unspents.slice(i, i + count));
            console.log("i",i, count)
        }
        console.log("unspents_slices", unspents_slices)
        for (let k = 0; k < unspents_slices.length; k+=1) {
            let unspentsLimit = []
            let utxoCalamount = 0;
            for (let i = 0; i < unspents_slices[k].length; i++) {
                unspentsLimit.push(unspents_slices[k][i])
                utxoCalamount += unspents_slices[k][i].amount
            }
            unspents_result.push({unspentsLimit, utxoCalamount})
        }

    } catch (error) {
        console.log(error)
    }
    return unspents_result
}

module.exports = {
    calNeedUtxo
}
