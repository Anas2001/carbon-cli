const {bytes} = require('@zilliqa-js/util');
export default {
    Main: {
        api: "https://api.zilliqa.com",
        chainId: 1, // chainId of the developer testnet
        msgVersion: 1, // current msgVersion
        VERSION: bytes.pack(1, 1),
    },
    Test: {
        api: "https://dev-api.zilliqa.com",
        chainId: 333, // chainId of the developer testnet
        msgVersion: 1, // current msgVersion
        VERSION: bytes.pack(333, 1),
    },
    Local: {
        api: "http://localhost:5555",
        chainId: 222, // chainId of the developer testnet
        msgVersion: 1, // current msgVersion
        VERSION: bytes.pack(222, 1),
    },
};