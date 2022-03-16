const { getUnspents, calcTargetUnspents } = require("../bitcoin/bitcoin.js")
const bitcoin = require("bitcoinjs-lib");
const colors = require('colors')
const Api = require("../chainx")
const { MIN_CHANGE } = require("../constants")

async function contructToCold(bitcoin_fee_rate, utxo_amount) {

    // 将 amount 转化为聪
    const amount =  Math.pow(10, 8) * parseFloat(utxo_amount);

    const info = await Api.getInstance().getTrusteeSessionInfo();
    const hotAddr = String(info.hotAddress.addr);
    const coldAddr = String(info.coldAddress.addr);
    const required = info.threshold;

    console.log(colors.blue(`hot address: ${hotAddr}, cold address: ${coldAddr} required: ${required}, total:${info.trusteeList.length}))`));
    const properties = await Api.getInstance().getChainProperties();

    const total = info.trusteeList.length;
    console.log(`total ${total} bitcoin type ${properties.bitcoinType}`)

    const unspents = await getUnspents(hotAddr, properties.bitcoinType);
    unspents.sort((a, b) => {
            return b.amount > a.amount
    });

    let [targetInputs, minerFee] = await calcTargetUnspents(
        unspents,
        amount,
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

    let change = inputSum - amount - minerFee;

    console.log(`inputSum ${inputSum} amount ${amount} minerFee ${minerFee}`);
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

    txb.addOutput(coldAddr, amount);
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