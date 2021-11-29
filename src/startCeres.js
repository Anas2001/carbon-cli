const os = require("os");
os.platform().toLowerCase().startsWith("win") ? require("./ceres/index-win") : require("./ceres/index");