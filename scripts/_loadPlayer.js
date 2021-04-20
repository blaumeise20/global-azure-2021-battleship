const { existsSync } = require("fs");
const { extname, resolve } = require("path");

const cwd = process.cwd();
const playerLocation = resolve(cwd, process.argv[3]);

if (!existsSync(playerLocation)) {
    console.log(`No file "${process.argv[3]}" found`);
    process.exit(1);
}

const ext = extname(playerLocation);
if (ext != ".js") {
    console.log(`The specified file must end with .js`);
    console.log(`You have specified a file with the extension ${ext}`);
    process.exit(1);
}

let player = require(playerLocation);
if (player.default) {
    player = player.default;
}

if (typeof player != "function" || !player.prototype || typeof player.prototype.getNextShot != "function") {
    console.log(`The player must be a class implementing a valid player`);
    process.exit(1);
}

module.exports = player;
