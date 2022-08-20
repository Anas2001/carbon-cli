import {parseArgumentAndOptions} from "./parseArgumentAndOptions";
import fs from "fs";
import {promisify} from "util";
import ncp from "ncp";
import path from "path";
import Lister from "listr";

const execa = require('execa');
import {projectInstall} from "pkg-install"
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
        p.scripts = {
            ...p.scripts,
            "zil-test": "jest --config ./jest-zilliqa.json",
        };
        p.dependencies = {
            ...p.dependencies,
            "@zilliqa-js/account": "^3.3.3",
            "@zilliqa-js/contract": "^3.3.3",
            "@zilliqa-js/crypto": "^3.3.3",
            "@zilliqa-js/subscriptions": "^3.3.3",
            "@zilliqa-js/util": "^3.3.3",
            "@zilliqa-js/zilliqa": "^3.3.3",
            "jest": "^27.2.5"
        };
        p.devDependencies = {
            ...p.devDependencies,
            "jest": "^27.2.5",
            "ts-jest": "^27.0.3"
        };
        await write(packagePath, JSON.stringify(p, null, 2), "utf8");
    } else {
        const p = JSON.parse(await read(path.resolve(templateDir, "zilliqa", "package.json")));
        await write(packagePath, JSON.stringify(p, null, 2), "utf8");
    }
    const data = JSON.parse(await read(path.resolve(templateDir, "zilliqa", "jest-zilliqa.json")));
    const tsConfig = JSON.parse(await read(path.resolve(templateDir, "zilliqa", "tsconfig.json")));
    await write(path.resolve(targetDirectory, "jest-zilliqa.json"), JSON.stringify(data, null, 2), "utf8");
    await write(path.resolve(targetDirectory, "tsconfig.json"), JSON.stringify(tsConfig, null, 2), "utf8");
};

async function initGit(options) {
    const result = await execa("git", ["init"], {
        cwd: options.targetDirectory,
    });
    if (result.failed) {
        return Promise.reject(new Error("Failed to init git repository"));
    }
};

async function install(options) {
    return projectInstall({
        cwd: options.targetDirectory
    });
};

export async function exec(args) {
    const options = parseArgumentAndOptions(args);
    const todos = [
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
            task: () => tryToRun(async () => {
                await remove(path.resolve(options.targetDirectory, "zilliqa", "package.json"));
                await remove(path.resolve(options.targetDirectory, "zilliqa", "jest-zilliqa.json"));
                await remove(path.resolve(options.targetDirectory, "zilliqa", "tsconfig.json"));
            })
        }
    ];

    if (options.git) {
        todos.push({
            title: "Initialization Git repository",
            task: () => tryToRun(async () => await initGit(options))
        });
    }

    if (options.runInstall) {
        todos.push({
            title: "Install npm packages",
            task: () => tryToRun(async () => await install(options))
        });
    }

    const tasks = new Lister(todos);

    await tasks.run();

    term.green("Create zilliqa project Done!");
    return true;
};