const { Select } = require('enquirer');
function remove0x(str) {
    if (str.startsWith("0x")) {
        return str.slice(2);
    } else {
        return str;
    }
}

function isNull(str) {
    if (str === "") return true;
    if (str === undefined) return true;
    if (str === null) return true;
    if (JSON.stringify(str) === "{}") return true;
    let regu = "^[ ]+$";
    let re = new RegExp(regu);
    return re.test(str);
}

function add0x(str) {
    if (str.startsWith("0x")) {
        return str;
    } else {
        return "0x" + str;
    }
}


const promtSelectDevice = async () => {
    console.log('\n')
    const prompt = new Select({
        name: 'select device',
        message: 'select device or privateKey',
        choices: ['privateKey ', 'ledger', 'trezor']
    });
    const device = await prompt.run();

    return device;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    remove0x,
    sleep,
    isNull,
    add0x,
    promtSelectDevice,
}