export default (contractName, contractData) => {
    const {contract_info} = contractData;
    const {transitions, events, fields} = contract_info;
    return `const {Zilliqa} = require("@zilliqa-js/zilliqa");
const {readFileSync} = require("fs");
const {units, Long, BN} = require("@zilliqa-js/util");  
const {resolve} = require("path");          
function contract({privateKey, api, version, net, contractAddress}) {
  let zilliqa = new Zilliqa(api);
  zilliqa.wallet.addByPrivateKey(privateKey);
  const code = readFileSync(resolve(process.cwd(), "zilliqa/contracts", "${contractName}"), "utf8");
  let initParams = ${JSON.stringify(contract_info.params)};
  let myAddress = contractAddress;
  return {
    init({privateKey, address}) {
      myAddress = address;
      if(privateKey) {
          zilliqa = new Zilliqa(api);
          zilliqa.wallet.addByPrivateKey(privateKey);
      }
    },
    replacePrivateKey(privateKey) {
         zilliqa = new Zilliqa(api);
         zilliqa.wallet.addByPrivateKey(privateKey);
    },
    getContractAddress() {
        return myAddress;
    },
    async deploy(${contract_info.params.map(({vname}) => vname).join(", ")}, gasLimit = 60000) {
        const args = arguments;
        initParams = initParams.filter(({vname}) => vname !== "_scilla_version").map((param, index) => {
            param.value = args[index].toString();
            param.type = param.type.split("with")[0].trim();
            return param;
        });
        initParams.push({
            vname: '_scilla_version',
            type: 'Uint32',
            value: '0',
        });
        const zilliqaContract = zilliqa.contracts.new(code, initParams);
        const [deployTx, deployedContract] = await zilliqaContract.deployWithoutConfirm({
            version,
            gasPrice: units.toQa('3500', units.Units.Li),
            gasLimit: Long.fromNumber(gasLimit),
        }, net === "Main");
        const confirmedTxn = await deployTx.confirm(deployTx.id);
        if (confirmedTxn.receipt.success === true) {
            myAddress = "0x" + deployedContract.address;
            return this;
        } else {
            throw new Error("something went wrong by contract deployment with txId: 0x" + deployTx.id);
        }
    },
    ${transitions.map(transition => `async ${transition.vname}(${transition.params.length ? transition.params.map(({vname}) => vname).join(", ") + ', ' : ""}gasPrice = 2000,gasLimit = 2000, zilAmount = 0, callback) {
        const args = arguments;
        const e = new Error();
        const frame = e.stack.split("\\n")[1];
        const tag = frame.split(" ")[5].split(".")[1];
        const params = ${JSON.stringify(transition.params)}.map((param, index) => {
            if (typeof args[index] === "object") {
                param.value = args[index];
            } else {
                param.value = args[index].toString();
            }
            param.type = param.type.split("with")[0].trim();
            return param;
        });
        const callTx = await zilliqa.contracts.at(myAddress).callWithoutConfirm(tag, params, {
            version,
            amount: new BN(zilAmount),
            gasPrice: units.toQa(gasPrice.toString(), units.Units.Li),
            gasLimit: Long.fromNumber(gasLimit),
        });
        
        if(callback) {
            callback("0x" + callTx.id);
        }
        const confirmedTxn = await callTx.confirm(callTx.id);
        if (!confirmedTxn.receipt.success) {
            console.log(JSON.stringify(confirmedTxn, null, 2));
        }
        return confirmedTxn.receipt.success === true;
    }`)},
    events: ${JSON.stringify(events.reduce((acc, event) => {
            const obj = {};
            obj[event.vname] = {
                name: event.vname,
                params: event.params.map(param => ({
                    name: param.vname,
                    type: param.type,
                })),
            };
            return Object.assign(acc, obj);
        }, {})
    )},
    fields: ${JSON.stringify(fields.reduce((acc, field) => {
        const obj = {};
        obj[field.vname] = {
            [field.vname]: field.vname,
            [field.type]: field.type,
        };
        return Object.assign(acc, obj);
    }, {}))}
  };  
};

module.exports = contract;`;
};