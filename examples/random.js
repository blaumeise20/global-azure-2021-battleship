"use strict";
const __1 = require("..");
module.exports = class CoolPlayer extends __1.Player {
    getNextShot() {
        return this.board.get(Math.floor(Math.random() * 100));
    }
};
