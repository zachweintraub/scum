const dotenv = require("dotenv");

dotenv.config();

const port = parseInt(process.env.PORT)
const syncPort = parseInt(process.env.SYNC_PORT);

module.exports = {
  "ui": {
    "port": 2100,
  },
  "files": ["public"],
  "watchEvents": ["change"],
  "watch": false,
  "server": false,
  "proxy": "localhost:" + port,
  "port": syncPort,
};