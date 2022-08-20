import {promisify} from "util";
import fs from "fs";
import path from "path";
import arg from "arg";
import inquirer from "inquirer";
import {parseParamsContract} from "./deployContract";
import createContractJsArtifact from "./createContractJsArtifact";

import Lister from "listr";
import tryToRun from "./tryToRun";

const term = require('terminal-kit').terminal;

const list = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const contractAbsPath = path.resolve(process.cwd(), "zilliqa", "contracts");
const contractPath = (contractName) => path.resolve(process.cwd(), "zilliqa", "contracts", contractName);

function parseArgumentAndOptions(rawArgs) {
    const args = arg({
        "--not-all": Boolean,
        "--contract": String,
        "-n": "--not-all",
        "-c": "--contract",
    }, {
        argv: rawArgs.slice(2)
    });
    return {
        notAll: args["--not-all"] || false,
        contractPath: args["--contract"] || null,
        contractsPath: contractAbsPath,
        targetDirectory: path.resolve(process.cwd(), "zilliqa", "artifacts")
    };
};


async function prompForMissingOptions(options) {
    if (options.notAll && !options.contractPath) {
        const questions = [{
            type: "list",
            name: "contractName",
            message: "Please choose one contract to compile: ",
            choices: await list(options.contractsPath),
        }];
        const answers = await inquirer.prompt(questions);
        return {
            ...options,
            contractPath: contractPath(answers.contractName),
            contractName: answers.contractName,
        };
    }
    return options;
}

async function compileScilla(contractPath, contractName, targetDir) {
    const code = fs.readFileSync(path.resolve(contractPath, contractName), "utf8");
    const contractData = await parseParamsContract(code);
    const artifact = createContractJsArtifact(contractName, contractData);
    if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, {recursive: true});
    }
    await writeFile(path.resolve(targetDir, contractName + ".js"), artifact, 'utf8');
}

export async function exec(args) {
    let options = parseArgumentAndOptions(args);
    options = await prompForMissingOptions(options);
    const tasks = [];
    if (!options.notAll) {
        const contracts = await list(options.contractsPath);
        for (let i = 0; i < contracts.length; i++) {
            tasks.push({
                title: "compile scilla contract: " + contracts[i],
                task: () => tryToRun(async () => await compileScilla(options.contractsPath, contracts[i], options.targetDirectory))
            });
        }
    } else {
        tasks.push({
            title: "compile scilla contract: " + options.contractName,
            task: () => tryToRun(async () => await compileScilla(options.contractPath, options.contractName, options.targetDirectory))
        });
    }

    await (new Lister(tasks)).run();

    term.green("Compile Done!");

    return true;
}