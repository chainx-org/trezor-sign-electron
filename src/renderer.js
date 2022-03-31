// TrezorConnect is injected as inline script in html
// therefore it doesn't need to included into node_modules
// get reference straight from window object
const { Trezor } = require("./trezor")
const {getInputsAndOutputsFromTx} = require('./bitcoin/bitcoin')
const { remove0x } = require('./util')
const {contructToCold} = require("./tocold")
const colors = require('colors')
const { redeemScript,BITCOIN_FEE_RATE} = require('./constants');
const { calNeedUtxo } = require('./util/cal')
//const {cal} = require('./cal')

// click to get public key
const btnSignWithTrezor = document.getElementById('sign-with-trezor');
const textRawTx = document.getElementById('text-rawtx');

const btnSignToCold = document.getElementById('sign-to-cold');
const inputBitcoinNumber = document.getElementById('input-slice-number');
const inputBitcoinFee = document.getElementById('input-bitcoin-fee');
const trezorAddress = document.getElementById('trezor-address');
const trezorPublicKey = document.getElementById('trezor-publickey');
const bitcoinType = "mainnet"

const signpanel = document.getElementById('text-signedtx');
inputBitcoinFee.value = BITCOIN_FEE_RATE
const trezor = new Trezor(bitcoinType);

inputBitcoinNumber.value = 16;
console.log(colors.red(`每次话费的txid数量: ${inputBitcoinNumber.value}`))

btnSignToCold.onclick = async () => {
    let toColdNumber = parseInt(inputBitcoinNumber.value)
    let toColdFee = inputBitcoinFee.value
    console.log(`toColdNumber: ${toColdNumber} toColdFee: ${toColdFee}`);
    const txs = await contructToCold(toColdNumber,toColdFee)
    console.log(`txs: ${JSON.stringify(txs)}`);
    textRawTx.value = JSON.stringify(txs)
    window.alert(JSON.stringify(txs))
}

btnSignWithTrezor.onclick = async () => {
   await trezor.init()
   let rawTx = textRawTx.value

   const address = await trezor.getAddress()
   const deviceInfo = await trezor.getXPubAndPublicKey()
   trezorAddress.innerText = `当前硬件钱包地址为：${address}`
   trezorPublicKey.innerText = `当前硬件钱包公钥为：${deviceInfo.publicKey}`

   console.log(colors.red(`当前钱包 address: ${address}  xpub: ${deviceInfo.xpub} publicKey: ${deviceInfo.publicKey}`));
   const inputAndOutPutResult = await getInputsAndOutputsFromTx(rawTx, bitcoinType);

   const signData = await trezor.sign(
       rawTx,
       inputAndOutPutResult.txInputs,
       remove0x(redeemScript),
       bitcoinType,
       deviceInfo
    );
    console.log(`signData: ${JSON.stringify(signData)}`);
    signpanel.value = JSON.stringify(signData)
};


