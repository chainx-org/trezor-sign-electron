// TrezorConnect is injected as inline script in html
// therefore it doesn't need to included into node_modules
// get reference straight from window object
const { TrezorConnect } = window;
const Api = require('./chainx');

// Initialize TrezorConnect
TrezorConnect.init({
    webusb: false, // webusb is not supported in electron
    debug: false, // see whats going on inside iframe
    lazyLoad: true, // set to "false" (default) if you want to start communication with bridge on application start (and detect connected device right away)
    // set it to "true", then trezor-connect will not be initialized until you call some TrezorConnect.method()
    // this is useful when you don't know if you are dealing with Trezor user
    manifest: {
        email: 'email@developer.com',
        appUrl: 'electron-app-boilerplate',
    },
})
    .then(() => {
        printLog('TrezorConnect is ready!');
    })
    .catch(error => {
        printLog(`TrezorConnect init error: ${error}`);
    });

// click to get public key
const btn = document.getElementById('get-xpub');
const log = document.getElementById('log');

btn.onclick = async () => {
    
   const res = await TrezorConnect.getPublicKey({
        path: "m/48'/0'/0'",
        coin: 'btc',
    })
    .catch(error => {
        console.log(`Error: ${error}`);
    })

    const xpub = res.payload.xpub;
    const publicKey = res.payload.publicKey;

    console.log(`xpub: ${xpub} publicKey: ${publicKey}`);

    await TrezorConnect
};

