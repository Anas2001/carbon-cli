export default (contractPath, contractData) => {
    const {contract_info} = contractData;
    const {transitions, events, fields} = contract_info;
    return `import {Zilliqa} from "@zilliqa-js/zilliqa";
import {readFileSync} from "fs";
import {units, Long, BN} from "@zilliqa-js/util";            
function contract({privateKey, api, version, net, contractAddress}) {
  let zilliqa = new Zilliqa(api);
  zilliqa.wallet.addByPrivateKey(privateKey);
  const code = readFileSync("${contractPath}", "utf8");
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
    }
    ,${transitions.map(transition => `async ${transition.vname}(${transition.params.length ? transition.params.map(({vname}) => vname).join(", ") + ', ' : ""}gasPrice = 2000,gasLimit = 2000, zilAmount = 0, callback) {
        const args = arguments;
        const e = new Error();
        const frame = e.stack.split("\\n")[1];
        const tag = frame.split(" ")[5].split(".")[1];
        const params = ${JSON.stringify(transition.params)}.map((param, index) => {
            param.value = args[index].toString();
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
        return confirmedTxn.receipt.success === true;
    }`)}
    ,events: ${JSON.stringify(events.reduce((acc, event) => {
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
    )}
    ,fields: ${JSON.stringify(fields.reduce((acc, field) => {
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