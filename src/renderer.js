// TrezorConnect is injected as inline script in html
// therefore it doesn't need to included into node_modules
// get reference straight from window object
const { Trezor } = require("./trezor")
const {getInputsAndOutputsFromTx} = require('./bitcoin/bitcoin')
const { remove0x } = require('./util')
const {contructToCold} = require("./tocold")
const { redeemScript,BITCOIN_FEE_RATE} = require('./constants');

// click to get public key
const btnSignWithTrezor = document.getElementById('sign-with-trezor');
const textRawTx = document.getElementById('text-rawtx');

const btnSignToCold = document.getElementById('sign-to-cold');
const inputBitcoinNumber = document.getElementById('input-bitcoin-number');
const inputBitcoinFee = document.getElementById('input-bitcoin-fee');

inputBitcoinNumber.value = 4.5;
inputBitcoinFee.value = BITCOIN_FEE_RATE
const trezor = new Trezor();

btnSignToCold.onclick = async () => {
    await trezor.init()
    let toColdNumber = inputBitcoinNumber.value
    let toColdFee = inputBitcoinFee.value
    console.log(`toColdNumber: ${toColdNumber} toColdFee: ${toColdFee}`);
    const hash = await contructToCold(toColdNumber,toColdFee)
    console.log(`hash: ${hash}`);
    textRawTx.value = hash
    window.alert(JSON.stringify(hash))
}

btnSignWithTrezor.onclick = async () => {
   await trezor.init()
   let rawTx = textRawTx.value
   const bitcoinType = "mainnet"
   const inputAndOutPutResult = await getInputsAndOutputsFromTx(rawTx, bitcoinType);
   const signData = await trezor.sign(
       rawTx, 
       inputAndOutPutResult.txInputs, 
       remove0x(redeemScript), 
       bitcoinType
    );
    console.log(`signData: ${JSON.stringify(signData)}`);
};


