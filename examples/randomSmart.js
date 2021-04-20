"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
class RandomPlayer extends __1.Player {
    constructor() {
        super(...arguments);
        this.triedFields = [];
    }
    getNextShot() {
        if (this.triedFields.length) {
            return this.triedFields.pop();
        }
        const val = Math.floor(Math.random() * this.board.unknownCells.length);
        return this.board.unknownCells[val];
    }
    registerShotContent(cell) {
        if (cell.is(__1.CellState.Ship)) {
            this.triedFields.push(...cell.neighbours().filter(n => this.board.unknownCells.includes(n) && !this.triedFields.find(x => x == n)));
        }
    }
}
exports.default = RandomPlayer;
