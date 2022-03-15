// TrezorConnect is injected as inline script in html
// therefore it doesn't need to included into node_modules
// get reference straight from window object
const { Trezor } = require("./trezor")
const {getInputsAndOutputsFromTx} = require('./bitcoin/bitcoin')
const { remove0x } = require('./util')
const Api = require('./chainx');
const { redeemScript } = require('./constants');

// click to get public key
const btn = document.getElementById('get-xpub');
const log = document.getElementById('log');
const trezor = new Trezor();

btn.onclick = async () => {
   await trezor.init()
   rawTx = log.value
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

