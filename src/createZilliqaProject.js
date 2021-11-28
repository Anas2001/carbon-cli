import {parseArgumentAndOptions} from "./parseArgumentAndOptions";
import fs from "fs";
import {promisify} from "util";
import ncp from "ncp";
import path from "path";

const access = promisify(fs.access);
const copy = promisify(ncp);


export async function exec(args) {
    const options = parseArgumentAndOptions(args);
    try {
        await access(options.targetDirectory, fs.constants.R_OK);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
    await copy(path.resolve("./template"), options.targetDirectory);
    console.log("Zilliqa projects created!");
};