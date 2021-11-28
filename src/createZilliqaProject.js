import {parseArgumentAndOptions} from "./parseArgumentAndOptions";
import fs from "fs";
import {promisify} from "util";
import ncp from "ncp";
import path from "path";

const access = promisify(fs.access);
const copy = promisify(ncp);


export async function exec(args) {
    const options = parseArgumentAndOptions(args);
    console.log(options.targetDirectory);
    try {
        await access(options.targetDirectory, fs.constants.R_OK);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
    const templateDir = path.resolve(
        new URL(import.meta.url).pathname,
        "../../template"
    );
    await copy(templateDir, options.targetDirectory);
    console.log("Zilliqa projects created!");
};