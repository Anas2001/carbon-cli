import {promisify} from "util";
import fs from "fs";
import path from "path";
import arg from "arg";
import inquirer from "inquirer";
import {parseParamsContract} from "./deployContract";
import createContractJsArtifact from "./createContractJsArtifact";

const list = promisify(fs.readdir);
const writeFile = promisify(fs.writeFile);
const contractAbsPath = path.resolve(process.cwd(), "zilliqa", "contracts");
const contractPath = (contractName) => path.resolve(contractAbsPath, contractName);

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
        };
    }
    return options;
}

async function compileScilla(contractPath, contractName, targetDir) {
    const code = fs.readFileSync(contractPath, "utf8");
    try {
        const contractData = await parseParamsContract(code);
        const artifact = createContractJsArtifact(contractPath, contractData);
        await writeFile(path.resolve(targetDir, contractName + ".js"), artifact, 'utf8');
    } catch (e) {
        console.log(e);
        console.error("something went wrong with parsing contract: ", contractPath);
    }
}

export async function exec(args) {
    let options = parseArgumentAndOptions(args);
    options = await prompForMissingOptions(options);
    if (!options.notAll) {
        const contracts = await list(options.contractsPath);
        for (let i = 0; i < contracts.length; i++) {
            await compileScilla(contractPath(contracts[i]), contracts[i], options.targetDirectory);
        }
    } else {
        await compileScilla(options.contractPath, options.targetDirectory);
    }
}