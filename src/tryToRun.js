const term = require('terminal-kit').terminal;

module.exports = async (fun, successMsg, errorMsg) => {
    try {
        const result = await fun();
        successMsg ? term.green(successMsg + "\n") : null;
        return result;
    } catch (error) {
        errorMsg && typeof errorMsg === "string" ? term.red(errorMsg) : console.log(error);
        return process.exit(1);
    }
};