import {program} from "commander";

import {exec as deploy} from "./deployContract";
import {exec as init} from "./createZilliqaProject";
import {exec as compile} from "./compileScilla";

export async function exec(args) {
    program.version("1.0.3");

    program
        .command("deploy")
        .description("used this command to deploy contracts that create under zilliqa/contracts folder")
        .action(async () => await deploy(args));

    program
        .command("init")
        .description("create zilliqa project template")
        .action(async () => await init(args));

    program
        .command("compile")
        .description("compile scilla contracts to js artifact")
        .option("-c, --contract", "contract path to compile")
        .option("-n, --not-all", "to choose only one contract to compile")
        .action(async () => await compile(args));

    program.parse(args);
}