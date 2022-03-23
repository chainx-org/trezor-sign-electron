const { getUnspents, calcTargetUnspents } = require("../bitcoin/bitcoin.js")
const bitcoin = require("bitcoinjs-lib");
const colors = require('colors')
const Api = require("../chainx")
const { MIN_CHANGE } = require("../constants")
const {getScriptPubkey} = require("musig2bitcoin");

async function contructToCold(rawAmount,bitcoin_fee_rate) {

    // 代转账金额
    const utxoCalamount =  Math.pow(10, 8) * parseFloat(rawAmount);

    const info = await Api.getInstance().getTrusteeSessionInfo();
    const hotAddr = String(info.hotAddress.addr);
    // todo: 等新的冷地址生成后替换成新的冷地址
    const coldAddr = String("bc1pj0hh43htncag2c5ufmfq86fuma802qje4reatudhvqyxe5k4sgmqjxutnd");
    const properties = await Api.getInstance().getChainProperties();
    const coldScriptPubkey = getScriptPubkey(coldAddr, properties.bitcoinType);
    const required = info.threshold;
    console.log(colors.blue(`hot address: ${hotAddr}, cold address: ${coldAddr}, coldScriptPubkey: ${coldScriptPubkey}, required: ${required}, total:${JSON.stringify(info.trusteeList)}))`));

    const total = info.trusteeList.length;
    console.log(`total ${total} bitcoin type ${properties.bitcoinType}`)

    const unspents = await getUnspents(hotAddr, properties.bitcoinType);
    unspents.sort((a, b) => {
            return b.amount > a.amount
    });
    // 每次取 200 个utxo
    console.log(`utxo length ${unspents.length}}`)

    let [targetInputs, minerFee] = await calcTargetUnspents(
        unspents,
        utxoCalamount,
        bitcoin_fee_rate,
        required,
        total
    );

    const inputSum = targetInputs.reduce((sum, input) => sum + input.amount, 0);
    if (!minerFee) {
        throw new Error("手续费计算错误");
    } else {
        minerFee = parseInt(parseFloat(minerFee.toString()).toFixed(0));
    }

    let change = inputSum - utxoCalamount - minerFee;

    console.log(`inputSum ${inputSum} amount ${utxoCalamount} minerFee ${minerFee}`);
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

    txb.addOutput(Buffer.from(coldScriptPubkey, "hex"), utxoCalamount);
    if (change > 0) {
        console.log(`hotAddr ${hotAddr} change ${change} BTC`);
        txb.addOutput(hotAddr, change);
    }
    const rawTx = txb.buildIncomplete().toHex();
    return rawTx;
}

module.exports = {
    contructToCold
}
