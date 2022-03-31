const {getUnspents, calcTargetUnspents} = require("../bitcoin/bitcoin.js")
const bitcoin = require("bitcoinjs-lib");
const colors = require('colors')
const Api = require("../chainx")
const {MIN_CHANGE} = require("../constants")
const {calNeedUtxo} = require("../util/cal");
const {readUInt64LE} = require("bitcoinjs-lib-zcash/src/bufferutils");

async function contructToCold(rawNumber, bitcoin_fee_rate) {

    const info = await Api.getInstance().getTrusteeSessionInfo(0);
    const hotAddr = String(info.hotAddress.addr);
    // todo: 等新的冷地址生成后替换成新的冷地址
    const coldAddr = String("3G3ARxPzbvb8EbVmfjYwE3yYcfeQhgGXMH");
    const properties = await Api.getInstance().getChainProperties();
    const required = info.threshold;
    console.log(colors.blue(`hot address: ${hotAddr}, cold address: ${coldAddr}, required: ${required}, total:${JSON.stringify(info.trusteeList)}))`));

    const total = info.trusteeList.length;
    console.log(`total ${total} bitcoin type ${properties.bitcoinType}`)
    const unspents = await calNeedUtxo(rawNumber)
    // 每次取 200 个utxo
    console.log(`unspents ${JSON.stringify(unspents)}  length ${unspents.length}`)
    let result = []
    for (let i = 0; i < unspents.length; i += 1) {
        let [targetInputs, minerFee] = await calcTargetUnspents(
            unspents[i]["unspentsLimit"],
            unspents[i]["utxoCalamount"] - 36000,
            bitcoin_fee_rate,
            required,
            total
        );
        console.log(`targetInputs ${JSON.stringify(targetInputs)}  targetInputs ${targetInputs.length}`)
        const inputSum = targetInputs.reduce((sum, input) => sum + input.amount, 0);
        if (!minerFee) {
            throw new Error("手续费计算错误");
        } else {
            minerFee = parseInt(parseFloat(minerFee.toString()).toFixed(0));
        }

        let change = inputSum - unspents[i]["utxoCalamount"] - minerFee;

        console.log(`inputSum ${inputSum} amount ${unspents[i]["utxoCalamount"]} minerFee ${minerFee}`);
        if (change < Number(MIN_CHANGE)) {
            change = 0;
        }
        const network =
            properties.bitcoinType === "mainnet"
                ? bitcoin.networks.bitcoin
                : bitcoin.networks.testnet;
        const txb = new bitcoin.TransactionBuilder(network);
        txb.setVersion(1);

        // @ts-ignore
        for (const unspent of targetInputs) {
            txb.addInput(unspent.txid, unspent.vout);
        }
        if (change > 0) {
            txb.addOutput(coldAddr, unspents[i]["utxoCalamount"] + change);
        } else {
            txb.addOutput(coldAddr, unspents[i]["utxoCalamount"]);
        }
        const rawTx = txb.buildIncomplete().toHex();
        result.push(rawTx)
    }
    return result;
}

module.exports = {
    contructToCold
}
