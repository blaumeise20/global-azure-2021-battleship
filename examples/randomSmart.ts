import { Player, CellState, Cell } from "..";

export default class RandomPlayer extends Player {
    triedFields: Cell[] = [];

    getNextShot() {
        if (this.triedFields.length) {
            return this.triedFields.pop();
        }

        const val = Math.floor(Math.random() * this.board.unknownCells.length);
        return this.board.unknownCells[val];
    }
    registerShotContent(cell: Cell) {
        if (cell.is(CellState.Ship)) {
            this.triedFields.push(...cell.neighbours().filter(n => this.board.unknownCells.includes(n) && !this.triedFields.find(x => x == n)));
        }
    }
}
