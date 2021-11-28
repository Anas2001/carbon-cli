import inquirer from "inquirer";
import {parseArgumentAndOptions} from "./parseArgumentAndOptions";
import {promisify} from "util";
import fs from "fs";

const list = promisify(fs.readdir);
const access = promisify(fs.access);
import path from "path";
import axios from "axios";

import nets from "./getZilliqaNets";

import {Zilliqa} from "@zilliqa-js/zilliqa";
import {units, Long} from "@zilliqa-js/util";

async function prompForMissingOptions() {
    const questions = [];
    const p = path.resolve(process.cwd(), "zilliqa/contracts");
    try {
        await access(p);
    } catch (error) {
        console.log(error);
        return process.exit(1);
    }
    questions.push({
        type: "list",
        name: "contract",
        message: "Please choose one contract to deploy:",
        choices: await list(p)
    })
    if (!process.env.ZILLIQA_PRIVATE_KEY) {
        questions.push({
            type: "password",
            name: "privateKey",
            message: "Please enter your private key: ",
        })
    }
    if (!process.env.ZILLIQA_NET) {
        questions.push({
            type: "list",
            name: "net",
            message: "Please choose zilliqa net: ",
            choices: Object.keys(nets),
        })
    }

    const answers = await inquirer.prompt(questions);
    return {
        contract: path.resolve(p, answers.contract),
        privateKey: answers.privateKey || process.env.ZILLIQA_PRIVATE_KEY,
        net: answers.net || process.env.ZILLIQA_NET
    };
};

export async function parseParamsContract(code) {
    const url = "https://scilla-server.zilliqa.com/contract/check";
    const {result, message} = (await axios.post(url, {code})).data;
    if (result) {
        return JSON.parse(message);
    }
    throw new Error("something went wrong with scilla parser");
}

async function prompForInitParams(initParams) {
    if (!initParams || !initParams.length) {
        return [];
    }
    const questions = initParams.map(param => ({
        type: "input",
        name: param.vname,
        message: "Please enter " + param.vname + " of type " + param.type + ": ",
    }));
    const answers = await inquirer.prompt(questions);
    return initParams.map(p => ({
        ...p,
        value: answers[p.vname].toString()
    }));
}

export async function exec(args) {
    const options = parseArgumentAndOptions(args);
    const {contract, privateKey, net} = await prompForMissingOptions(options);
    const code = fs.readFileSync(contract, "utf8");
    const contractParse = await parseParamsContract(code);
    const contractInfo = contractParse.contract_info;
    console.log(`Deploying the contract ${contractInfo.vname} on ${net} Net!`);
    const zilliqa = new Zilliqa(nets[net].api);
    zilliqa.wallet.addByPrivateKey(privateKey);
    const initParams = contractInfo.params;
    // const transitions = contractInfo.transitions;
    const init = await prompForInitParams(initParams);
    init.push({
        vname: '_scilla_version',
        type: 'Uint32',
        value: '0',
    })
    const zilliqaContract = zilliqa.contracts.new(code, init);
    const [deployTx, deployedContract] = await zilliqaContract.deployWithoutConfirm({
        version: nets[net].VERSION,
        gasPrice: units.toQa('3500', units.Units.Li),
        gasLimit: Long.fromNumber(60000),
    }, net === "Main");
    const confirmedTxn = await deployTx.confirm(deployTx.id);
    if (confirmedTxn.receipt.success === true) {
        console.log(`Contract address is: 0x${deployedContract.address}`);
    } else {
        console.log(`contract deployment of tx 0x${deployTx.id} failed`);
    }
    return true;
}