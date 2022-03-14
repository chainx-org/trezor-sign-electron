// TrezorConnect is injected as inline script in html
// therefore it doesn't need to included into node_modules
// get reference straight from window object
const { Trezor } = require("./trezor")
const Api = require('./chainx');

// click to get public key
const btn = document.getElementById('get-xpub');
const log = document.getElementById('log');

btn.onclick = async () => {
   trezor = new Trezor();
   await trezor.init()
   
   const [xpub,publicKey] = await trezor.getXPubAndPublicKey()
    .catch(error => {
        console.log(`Error: ${error}`);
    })


    console.log(`xpub: ${xpub} publicKey: ${publicKey}`);

    await TrezorConnect
};

