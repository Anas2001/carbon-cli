export default (contractPath, contractData) => {
    const {contract_info} = contractData;
    const {transitions, events, fields} = contract_info;
    return `const {Zilliqa} = require("@zilliqa/zilliqa");
import fs from "fs";
import {units, Long, BN} from "@zilliqa-js/util";            
module.exports = ({privateKey, api, version, net, contractAddress}) => {
  const zilliqa = new Zilliqa(api);
  zilliqa.wallet.addByPrivateKey(privateKey);
  const code = fs.readFileSync("${contractPath}", "utf8");
  let initParams = ${JSON.stringify(contract_info.params)};
  initParams.push({
    vname: '_scilla_version',
    type: 'Uint32',
    value: '0',
  });
  let myAddress = contractAddress;
  return {
    init({privateKey, address}) {
      myAddress = address;
      if(privateKey) {
        zilliqa.wallet.addByPrivateKey(privateKey);
      }
    },
    replacePrivateKey(privateKey) {
        zilliqa.wallet.addByPrivateKey(privateKey);
    },
    async deploy(${contract_info.params.map(({vname}) => vname).join(", ")}, gasLimit = 60000) {
        const args = arguments;
        initParams = initParams.map((param, index) => {
            param.vname = args[index].toString();
            return param;
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
    ,${transitions.map(transition => `async ${transition.vname}({${transition.params.map(({vname}) => vname).join(", ")}}, {gasPrice = 2000,gasLimit = 2000, zilAmount = 0}, callback) {
        const args = arguments;
        const tag = args.callee.name;
        let params = ${JSON.stringify(transition.params)};
        params = params.map((param, index) => {
            param.value = args[index].toString();
            return param;
        });
        const callTx = await zilliqa.contracts.at(myAddress).callWithoutConfirm(tag, params, {
            version,
            amount: new BN(zilAmount),
            gasPrice: units.toQa(gasPrice.toString(), units.Units.Li),
            gasLimit: Long.fromNumber(8000),
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
            name: field.vname,
            type: field.type,
        };
        return Object.assign(acc, obj);
    }, {}))}
  };  
};`;
};