const { getUnspents, calcTargetUnspents } = require("../bitcoin/bitcoin.js")
const bitcoin = require("bitcoinjs-lib");
const colors = require('colors')
const Api = require("../chainx")
const { MIN_CHANGE } = require("../constants")

async function contructToCold(rawAmount,bitcoin_fee_rate) {

    // 代转账金额
    const utxoCalamount =  Math.pow(10, 8) * parseFloat(rawAmount);

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
    // 每次取 200 个utxo 
    console.log(`utxo length ${unspents.length}}`)

    const utxolength = unspents.length > 195 ? 195 : unspents.length;

    let utxopre = 0
    for (let i = 0; i < utxolength; i ++) {
        utxopre += unspents[i].amount
    }
 
    console.log(`转账的 utxoCalamount: ${utxoCalamount} `)
    console.log(`前200 utxopre 数量: ${utxopre} `)

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

    txb.addOutput(coldAddr, utxoCalamount);
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