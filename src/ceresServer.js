const os = require("os");
const {Docker} = require("node-docker-api");
const isWindow = os.platform().toLowerCase().startsWith("win");
const docker = new Docker({socketPath: isWindow ? "//./pipe/docker_engine" : "/var/run/docker.sock"});

const express = require("express");
const app = express();
//
// const services = {
//     local: "zilliqa-isolated-server",
//     faucet: "zilliqa-isolated-server-faucet",
//     scilla: "scillaserver",
// };

const {exec} = require("child_process");
const which = require("which");

function execPromise(command) {
    return new Promise(function (resolve, reject) {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
                return;
            }
            resolve(stdout.trim());
        });
    });
}


module.exports = {
    startImage: async () => {
        try {
            const docker = await which("docker");
            await execPromise(docker + " run -d -p '5555:5555' --name zilliqa-isolated-server --label ceres zilliqa/zilliqa-isolated-server");
            await execPromise(docker + " run -d -p '5557:5557' --name devex --label ceres zilliqa/devex");
            app.listen(7000, () => console.log("Ceres Server started"));
        } catch (e) {
            console.log(e);
            process.exit(1);
        }
    },
    closeCeres: async () => {
        const containers = await docker.container.list({all: true, filters: {label: ["ceres"]}});
        await Promise.all(containers.map(async container => await container.stop()));
        await Promise.all(containers.map(async container => await container.delete({force: true})));
        console.log("All ceres servers closed");
    },
    // services,
};