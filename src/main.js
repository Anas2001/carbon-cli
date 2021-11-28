import {program} from "commander";

import {exec as deploy} from "./deployContract";
import {exec as init} from "./createZilliqaProject";

export async function exec(args) {
    program.version("1.0.0");

    program
        .command("deploy")
        .action(async () => await deploy(args));

    program
        .command("init")
        .action(async () => await init(args));

    program.parse(args);
}