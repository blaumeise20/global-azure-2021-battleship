import { Player } from "..";

export = class CoolPlayer extends Player {
    getNextShot() {
        return this.board.get(Math.floor(Math.random() * 100));
    }
};
