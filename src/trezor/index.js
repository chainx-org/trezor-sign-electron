const reverse = require("buffer-reverse");
const bitcoin = require("bitcoinjs-lib-zcash");
const bs58check = require("bs58check");
const { getPubKeysFromRedeemScript } = require("../bitcoin/bitcoin-utils");
const bitcore = require("bitcore-lib");
const { TrezorConnect } = window;

const colors = require('colors')

const hardeningConstant = 0x80000000;
const mainnetPath = [
    (45 | hardeningConstant) >>> 0,
    (0 | hardeningConstant) >>> 0,
    (0 | hardeningConstant) >>> 0,
    0,
    0
];
const testnetPath = [
    (45 | hardeningConstant) >>> 0,
    (1 | hardeningConstant) >>> 0,
    (0 | hardeningConstant) >>> 0,
    0,
    0
];

function getSignatures(input, pubs) {
    if (input.signatures) {
        return input.signatures.map(sig => {
            return sig ? bitcore.crypto.Signature.fromBuffer(sig, false).toString() : "";
        });
    }
    return pubs.map(() => "");
}

function constructMultisig(
    pubKeys,
    devicePubKey,
    deviceXpub,
    signatures,
    m,
    network = "mainnet"
) {
    const net =
        network === "mainnet" ? bitcoin.networks.bitcoin : bitcoin.networks.testnet;

    function getNode(xpub) {
        const hd = bitcoin.HDNode.fromBase58(xpub, net);
        return {
            depth: hd.depth,
            child_num: hd.index,
            fingerprint: hd.parentFingerprint,
            public_key: hd.keyPair.getPublicKeyBuffer().toString("hex"),
            chain_code: hd.chainCode.toString("hex")
        };
    }

    function getDefaultXpub(pub) {
        const chaincode = Buffer.from(
            "0000000000000000000000000000000000000000000000000000000000000000",
            "hex"
        );

        const buffer = Buffer.allocUnsafe(78);
        buffer.writeUInt32BE(net.bip32.public, 0);
        buffer.writeUInt8(0, 4);
        buffer.writeUInt32BE(0x00000000, 5);
        buffer.writeUInt32BE(0x00000000, 9);
        chaincode.copy(buffer, 13);
        Buffer.from(pub, "hex").copy(buffer, 45);

        return bs58check.encode(buffer);
    }

    const pubkeys = pubKeys.map(pub => {
        return {
            node:
                pub !== devicePubKey
                    ? getNode(getDefaultXpub(pub))
                    : getNode(deviceXpub),
            address_n: []
        };
    });

    return {
        pubkeys,
        signatures,
        m
    };
}

function getMultisigObj(input, redeemScript, devicePubKey, deviceXpub, network = "mainnet") {
    const [m, pubs] = getPubKeysFromRedeemScript(redeemScript);
    const signatures = getSignatures(input, pubs);
    return constructMultisig(
        pubs,
        devicePubKey,
        deviceXpub,
        signatures,
        m,
        network
    );
}

function constructInputs(tx, redeemScript, devicePubKey, deviceXpub, network = "mainnet") {
    const txb = bitcoin.TransactionBuilder.fromTransaction(
        tx,
        network === "mainnet"
            ? bitcoin.networks.bitcoin
            : bitcoin.networks.testnet
    );

    const multisigArr = txb.inputs.map(input => {
        return getMultisigObj(input, redeemScript, devicePubKey, deviceXpub, network);
    })

    return tx.ins.map((input, index) => {
        return {
            address_n: network === "mainnet" ? mainnetPath : testnetPath,
            script_type: "SPENDMULTISIG",
            prev_index: input.index,
            prev_hash: reverse(input.hash).toString("hex"),
            multisig: multisigArr[index]
        };
    });
}

function constructOutputs(raw, network = "mainnet") {
    const tx = bitcore.Transaction(raw);
    const net =
        network === "mainnet" ? bitcore.Networks.mainnet : bitcore.Networks.testnet;
    return tx.outputs.map(output => {
        const address = bitcore.Address.fromScript(output.script, net).toString();
        return {
            amount: output.satoshis,
            address,
            script_type: "PAYTOADDRESS"
        };
    });
}

function bjsTx2refTx(tx) {
    const extraData = tx.getExtraData();
    return {
        lock_time: tx.locktime,
        version: tx.isDashSpecialTransaction()
            ? tx.version | (tx.dashType << 16)
            : tx.version,
        hash: tx.getId(),
        inputs: tx.ins.map(function (input) {
            return {
                prev_index: input.index,
                sequence: input.sequence,
                prev_hash: reverse(input.hash).toString("hex"),
                script_sig: input.script.toString("hex")
            };
        }),
        bin_outputs: tx.outs.map(function (output) {
            return {
                amount: output.value,
                script_pubkey: output.script.toString("hex")
            };
        }),
        extra_data: extraData ? extraData.toString("hex") : null,
        version_group_id: tx.isZcashTransaction()
            ? parseInt(tx.versionGroupId, 16)
            : null
    };
}

function constructPreTxs(inputsArr) {
    return inputsArr
        .map(input => bitcoin.Transaction.fromHex(input.raw))
        .map(bjsTx2refTx);
}


class Trezor {
    bitcoinPath = null
    constructor(network = "mainnet"){
        this.bitcoinPath = network === "mainnet" ? mainnetPath : testnetPath;
    }
    
    async init() {
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
    }

    async getAddress() {
        const response = await TrezorConnect.getAddress({
            path: this.bitcoinPath,
            coin: 'btc'
        });
        if (response.success) {
            return response.payload.address;
        }
        return null;
    }

    async getXPubAndPublicKey() {
        const res = await TrezorConnect.getPublicKey({
            path: this.bitcoinPath,
            coin: 'btc',
        })
        .catch(error => {
            console.log(`Error: ${error}`);
        })
        const xpub = res.payload.xpub;
        const publicKey = res.payload.publicKey;

        return {
            xpub:xpub,
            publicKey:publicKey
        }
    }

    async sign(raw, inputsArr, redeemScript,network="mainnet",deviceInfo) {
        if (!redeemScript) {
            redeemScript = getRedeemScriptFromRaw(raw, network);
        }
        if (!redeemScript) {
            throw new Error("redeem script not provided");
        }


        const transaction = bitcoin.Transaction.fromHex(raw);
        const inputs = constructInputs(transaction, redeemScript, deviceInfo.publicKey, deviceInfo.xpub, network);
        const outputs = constructOutputs(raw, network);

        const txs = constructPreTxs(inputsArr);

        //console.log(`trezor sign inputs: ${JSON.stringify(inputs)}`);
        //console.log(`trezor sign outputs: ${JSON.stringify(outputs)}`);
        //console.log(`trezor sign txs: ${JSON.stringify(txs)}`);

        const res = await TrezorConnect.signTransaction({
            coin: 'btc',
            inputs: inputs,
            outputs: outputs,
            refTxs: txs,
        })
        .catch(error => {
            console.log(`Error: ${error}`);
        })
        return res
    }

    async signMessage(message) {
        const res = await TrezorConnect.signMessage({
            path: this.bitcoinPath,
            message: message,
        }).catch(error => {
            console.log(`Error: ${error}`);
        })
        return res

    }

}

module.exports  = {
    Trezor,
    constructInputs,
    constructOutputs,
    constructPreTxs
}