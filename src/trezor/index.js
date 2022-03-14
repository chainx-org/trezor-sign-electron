const reverse = require("buffer-reverse");
const bitcoin = require("bitcoinjs-lib-zcash");
const bs58check = require("bs58check");
const { getPubKeysFromRedeemScript } = require("./bitcoin-utils");
const bitcore = require("bitcore-lib");

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


module.exports  = {
    constructInputs,
    constructOutputs,
    constructPreTxs
}