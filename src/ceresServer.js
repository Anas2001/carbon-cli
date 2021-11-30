const os = require("os");
const {Docker} = require("node-docker-api");
const isWindow = os.platform().toLowerCase().startsWith("win");
const docker = new Docker({socketPath: isWindow ? "//./pipe/docker_engine" : "/var/run/docker.sock"});

const express = require("express");
const app = express();

const services = {
    local: "zilliqa-isolated-server",
    faucet: "zilliqa-isolated-server-faucet",
    scilla: "scillaserver",
};

module.exports = {
    startImage: async (image) => {
        const containers = await docker.container.list({all: true, filters: {label: ["ceres"]}});
        const exists = containers.find(container => container.data.Labels.ceres === image);
        if (!!exists) {
            await exists.start();
            app.listen(7000, () => console.log("Ceres Server started"))
        }
    },
    closeCeres: async () => {
        const containers = await docker.container.list({all: true, filters: {label: ["ceres"]}});
        const toCloseContainers = containers.filter(container => !!Object.keys(services).find(key => services[key] === container.data.Labels.ceres));
        await Promise.all(toCloseContainers.map(async container => await container.stop()));
        console.log("All ceres servers closed");
    },
    services,
};