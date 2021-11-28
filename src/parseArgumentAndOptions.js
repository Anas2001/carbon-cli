import arg from "arg";

export function parseArgumentAndOptions(rawArgs) {
    const args = arg({
        "--git": Boolean,
        "--path": String,
        "--target": String,
        "--install": Boolean,
        "-t": "--target",
        "-g": "--git",
        "-p": "--path",
        "-i": "--install"
    }, {
        argv: rawArgs.slice(2)
    });
    return {
        git: args["--git"] || false,
        path: args["--path"] || null,
        runInstall: args["--install"] || false,
        targetDirectory: args["--target"] || process.cwd()
    };
};