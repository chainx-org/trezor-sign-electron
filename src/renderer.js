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
   console.log(`rawTx: ${rawTx}`);
   const inputAndOutPutResult = await getInputsAndOutputsFromTx('01000000014401a3070c1ad369e9540415dfddc1d63539df81e39dd9633bcf92119e44a0260100000000ffffffff0200e1f5050000000017a9143cb48559ce25173abcc3af7452ce8c6e2791f90a87d3ca02000000000017a914d246f700f4969106291a75ba85ad863cae68d6678700000000', bitcoinType);
   console.log(`inputAndOutPutResult: ${JSON.stringify(inputAndOutPutResult)}`);
   return
   const signData = await trezor.sign(
       rawTx, 
       inputAndOutPutResult.txInputs, 
       remove0x(redeemScript), 
       bitcoinType
    );
    console.log(`signData: ${JSON.stringify(signData)}`);
};

