import {program} from "commander";

import {exec as deploy} from "./deployContract";
import {exec as init} from "./createZilliqaProject";
import {exec as compile} from "./compileScilla";
import {exec as addScilla} from "./addScillaContract";
import {exec as addTestScilla} from "./addScillaTestContract";

import ceresServer from "./ceresServer";

import execa from "execa";
import Lister from "listr";

import packageJson from "../package.json";

export async function exec(args) {
    program.version(packageJson.version);

    program
        .command("deploy")
        .description("used this command to deploy contracts that create under zilliqa/contracts folder")
        .action(async () => await deploy(args));

    program
        .command("init")
        .description("create zilliqa project template")
        .option("-g, --git", "init git repository for project")
        .option("-i, --install", "install packages")
        .action(async () => await init(args));

    program
        .command("compile")
        .description("compile scilla contracts to js artifact")
        .option("-c, --contract", "contract path to compile")
        .option("-n, --not-all", "to choose only one contract to compile")
        .action(async () => await compile(args));

    program
        .command("scilla")
        .description("create new scilla contract template")
        .option("-n, --name", "contract name without ext .scilla")
        .action(async () => await addScilla(args));

    program
        .command("scilla-test")
        .description("create new scilla test contract template")
        .option("-n, --name", "contract name without ext .js | .ts")
        .action(async () => await addTestScilla(args));

    program
        .command("test")
        .description("run all tests under test folder with prefix .spec.(t|j)s")
        .action(async () => {
            const tasks = new Lister([
                {
                    title: "Run scilla contracts tests",
                    task: () => execa("npm", ["run", "zil-test"], {cwd: process.cwd()})
                }
            ]);
            await tasks.run();
        });

    program
        .command("ceres")
        .description("start ceres server")
        .action(async () => await ceresServer.startImage());

    program.parse(args);
};

process.on('SIGINT', async () => {
    console.log("Please wait until ceres service stop....");
    await ceresServer.closeCeres();
    console.log("Done!");
    process.exit(0);
});