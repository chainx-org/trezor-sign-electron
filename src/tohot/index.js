const { getUnspents, calcTargetUnspents } = require("../bitcoin/bitcoin.js")
const bitcoin = require("bitcoinjs-lib");
const colors = require('colors')
const Api = require("../chainx")

async function contructToCold(bitcoin_fee_rate, utxo_amount) {
    const info = await Api.getInstance().getTrusteeSessionInfo();
    const hotAddr = info.hotAddress.addr;
    const coldAddr = info.coldAddress.addr;
    const required = info.threshold;

    console.log(colors.yellow(`redeem script ${info.coldAddress.redeemScript.toString()}`))
    const properties = await Api.getInstance().getChainProperties();

    const total = info.trusteeList.length;
    console.log(`total ${total} bitcoin type ${properties.bitcoinType}`)

    const unspents = await getUnspents(hotAddr, properties.bitcoinType);
    unspents.sort((a, b) => {
            return b.amount > a.amount
    });

    let [targetInputs, minerFee] = await calcTargetUnspents(
        unspents,
        utxo_amount,
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

    let change = inputSum - this.amount - minerFee;

    console.log(`inputSum ${inputSum} amount ${this.amount} minerFee ${minerFee}`);
    if (change < Number(process.env.min_change)) {
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

    txb.addOutput(coldAddr, this.amount);
    if (change > 0) {
        console.log(`hotAddr ${hotAddr} change ${change} BTC`);
        txb.addOutput(hotAddr, change);
    }
    const rawTx = txb.buildIncomplete().toHex();
    console.log("未签原始交易原文:");
    console.log(colors.green(rawTx));
    return rawTx;
}

module.exports = {
    contructToCold
}