import {program} from "commander";

import {exec as deploy} from "./deployContract";
import {exec as init} from "./createZilliqaProject";

export async function exec(args) {
    program.version("1.0.2");

    program
        .command("deploy")
        .description("used this command to deploy contracts that create under zilliqa/contracts folder")
        .action(async () => await deploy(args));

    program
        .command("init")
        .description("create zilliqa project template")
        .action(async () => await init(args));

    program.parse(args);
}