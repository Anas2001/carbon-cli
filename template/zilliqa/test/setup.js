const axios = require("axios");
module.exports = () => {
    return {
        async start() {
            await axios.post("http://localhost:3939/container/start", {
                image: "zilliqa-isolated-server",
            });
            await new Promise((resolve) => setTimeout(resolve, 20000));
        },
        async stop() {
            const containers = (await axios.get("http://localhost:3939/container/list")).data;
            await Promise.all(containers.map(async (container) => await axios.post("http://localhost:3939/container/stop", {
                id: container.Id,
            })));
        }
    };
};