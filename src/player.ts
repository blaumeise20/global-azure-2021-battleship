import { Board, Cell } from "./board";

/**
 * The base class for every player.
 */
export abstract class Player<T = any> {
    protected gameId: string;
    protected board: Board<T>;
    protected lastShot: Cell<T>;

    constructor(gameId: string) {
        this.gameId = gameId;
        this.board = new Board<T>();
        this.lastShot = null;
    }

    /**
     * Calculates the next shot on the board.
     */
    abstract getNextShot(): Cell<T>;

    /**
     * Registeres the content of a shot.
     * @param i The index of the last shot.
     * @param content The content recieved.
     */
    registerShotContent(content: Cell<T>) {}
}
