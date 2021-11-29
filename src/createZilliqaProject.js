import {parseArgumentAndOptions} from "./parseArgumentAndOptions";
import fs from "fs";
import {promisify} from "util";
import ncp from "ncp";
import path from "path";
import Lister from "listr";
import tryToRun from "./tryToRun";
const term = require('terminal-kit').terminal;

const access = promisify(fs.access);
const copy = promisify(ncp);
const write = promisify(fs.writeFile);
const exists = promisify(fs.exists);
const remove = promisify(fs.unlink);
const read = promisify(fs.readFile);
const templateDir = path.resolve(new URL(import.meta.url).pathname, "../../template");

const createOrAddZilliqaDepends = async (targetDirectory) => {
    const packagePath = path.resolve(targetDirectory, "package.json");
    if (await exists(packagePath)) {
        const p = JSON.parse(await read(packagePath, "utf8"));
        p.dependencies = {
            ...p.dependencies,
            "@zilliqa-js/account": "^3.3.3",
            "@zilliqa-js/contract": "^3.3.3",
            "@zilliqa-js/crypto": "^3.3.3",
            "@zilliqa-js/subscriptions": "^3.3.3",
            "@zilliqa-js/util": "^3.3.3",
            "@zilliqa-js/zilliqa": "^3.3.3",
        };
        await write(packagePath, JSON.stringify(p, null, 2), "utf8");
    } else {
        const p = JSON.parse(await read(path.resolve(templateDir, "zilliqa", "package.json")));
        await write(packagePath, JSON.stringify(p, null, 2), "utf8");
    }

}

export async function exec(args) {
    const options = parseArgumentAndOptions(args);
    const tasks = new Lister([
        {
            title: "Check access to target dir: " + options.targetDirectory,
            task: () => tryToRun(async () => await access(options.targetDirectory, fs.constants.R_OK))
        },
        {
            title: "Add zilliqa dependencies to package.json file",
            task: () => tryToRun(async () => await createOrAddZilliqaDepends(options.targetDirectory))
        },
        {
            title: "Copy project template files",
            task: () => tryToRun(async () => await copy(templateDir, options.targetDirectory))
        },
        {
            title: "Clean up",
            task: () => tryToRun(async () => await remove(path.resolve(options.targetDirectory, "zilliqa", "package.json")))
        }
    ]);

    await tasks.run();

    term.green("Create zilliqa project Done! \n");
    return true;
};