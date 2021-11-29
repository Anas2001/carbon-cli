import {program} from "commander";

import {exec as deploy} from "./deployContract";
import {exec as init} from "./createZilliqaProject";
import {exec as compile} from "./compileScilla";
import {exec as addScilla} from "./addScillaContract";

export async function exec(args) {
    program.version("1.0.5");

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

    program.parse(args);
}