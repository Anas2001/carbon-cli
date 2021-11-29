const term = require('terminal-kit').terminal;

module.exports = async (fun, successMsg, errorMsg, terminated = false) => {
    try {
        const result = await fun();
        successMsg ? term.green(successMsg + "\n") : null;
        return result;
    } catch (error) {
        errorMsg ? term.red(errorMsg + "\n") : console.log(error);
        if (terminated)
            return process.exit(1);
    }
};