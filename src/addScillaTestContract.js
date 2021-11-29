import Lister from "listr";
import tryToRun from "./tryToRun";

import inquirer from "inquirer";

import {promisify} from "util";
import fs from "fs";
import path from "path";
import arg from "arg";

const contractAbsPath = path.resolve(process.cwd(), "zilliqa", "test");
import createContractScillaTest from "./createScillaTest";

const writeFile = promisify(fs.writeFile);

const list = promisify(fs.readdir);

function parseArgumentAndOptions(rawArgs) {
    const args = arg({
        "--name": String,
        "-n": "--name",
    }, {
        argv: rawArgs.slice(2)
    });
    return {
        contractName: args["--name"] + ".spec.js" || null,
    };
};

async function prompForMissingOptions(options) {
    if (!options.name) {
        const questions = [{
            type: "input",
            name: "contractName",
            message: "Please enter the name of test: ",
        }];
        const answers = await inquirer.prompt(questions);
        return {
            ...options,
            contractName: answers.contractName + ".spec.js",
        };
    }
    return options;
};
const checkExistsFile = async (contractName) => {
    const contracts = (await list(contractAbsPath)).map(file => file.toLowerCase());
    if (contracts.includes(contractName.toLowerCase())) {
        throw new Error("Contract already exists in contracts folder")
    }
};

const addScillaFile = async (contractName) => {
    const code = createContractScillaTest(contractName.split(".")[0]);
    await writeFile(path.resolve(contractAbsPath, contractName), code, "utf8");
}

export async function exec(args) {
    let options = parseArgumentAndOptions(args);
    options = await prompForMissingOptions(options);
    if (options.contractName === ".spec.js" || !options.contractName) {
        return exec(args);
    }
    const tasks = new Lister([
        {
            title: "Check test file file exists: " + options.contractName,
            task: () => tryToRun(async () => checkExistsFile(options.contractName)),
        },
        {
            title: "Add new test file to test folder: " + options.contractName,
            task: () => tryToRun(() => addScillaFile(options.contractName))
        }
    ]);

    await tasks.run();
    return true;
}