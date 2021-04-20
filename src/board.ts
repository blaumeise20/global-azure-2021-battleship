export enum Direction {
    Up,
    Right,
    Down,
    Left,
}

/**
 * Represents a whole playing board.
 */
export class Board<T = any> {
    private _field!: Cell<T>[];
    /**
     * All the boats left to shoot at.
     */
    public leftShips: number[] = [2, 3, 3, 4, 5];
    /**
     * Already sunken ships.
     */
    public sunkenShips: Ship<T>[] = [];
    /**
     * All cells in this board.
     */
    public get cells() {
        return this._field;
    }

    constructor(state = CellState.Unknown) {
        this._field = Array(100).fill(0).map((_, i) => new Cell<T>(state, this, i));
    }

    /**
     * A list of all cells that have the state `Unknown`
     */
    public get unknownCells() {
        return this._field.filter(x => x.is(CellState.Unknown));
    }

    /**
     * Returns the cell at the specified index.
     * @param i The index to get.
     * @returns The state at the index.
     */
    public get(i: number): Cell<T>;
    /**
     * Returns the cell at the specified index.
     * @param x The X axis.
     * @param y The Y axis.
     * @returns The state at the index.
     */
    public get(x: number, y: number): Cell<T>;
    public get(i: number, y?: number) {
        if (typeof y == "number" && typeof i == "number") {
            if (i < 0 || i > 9) throw new Error("X axis must be in between 0 and 9.");
            if (y < 0 || y > 9) throw new Error("Y axis must be in between 0 and 9.");
            i = y * 10 + i;
        }
        if (i < 0 || i > 99) throw new Error("Board index must be in between 0 and 99.");

        return this._field[i];
    }

    /**
     * Checks if a sppecified ship can be placed on the board.
     * @param ship The ship to check.
     * @returns If the ship can be placed like this.
     */
    public canPlaceShip(ship: Ship, canHaveWater: boolean = false) {
        const cells = ship.getCells();
        if (!cells) return false;

        if (cells.some(c => c.is(CellState.Water) && !canHaveWater || c.is(CellState.Sunken) || canHaveWater && c.is(CellState.Ship))) return false;

        const outerCells: Cell<T>[] = [];
        cells.forEach(c => {
            outerCells.push(...c.neighbours(true).filter(n => !cells.includes(n) && !outerCells.includes(n)));
        });

        if (outerCells.some(c => c.is(CellState.Ship) || c.is(CellState.Sunken))) return false;

        return true;
    }

    /**
     * Clears all the data from the cells.
     */
    public clearData(data: T = null) {
        this._field.forEach(c => c.data = data);
    }

    toString() {
        let result = "";
        this._field.forEach((c, i) => {
            if (i % 10 == 0 && i != 0) {
                result += "\n";
            }
            result += ["  ", "W ", "S ", "X "][c.state];
        });
        return result;
    }
}

/**
 * Represents one single cell on the board.
 */
export enum CellState {
    Unknown,
    Water,
    Ship,
    Sunken,
}

/**
 * Represents one cell that can have data.
 */
export class Cell<T = any> {
    /**
     * The board this cell is in.
     */
    public board: Board<T>;
    /**
     * The currently known state of the cell.
     */
    public state: CellState;
    /**
     * Optional data.
     */
    public data: T | null;
    /**
     * The cell index.
     */
    public ix: number;

    constructor(state: CellState, board: Board<T>, ix: number) {
        this.board = board;
        this.state = state;
        this.data = null;
        this.ix = ix;
    }

    /**
     * The X axix on the board.
     */
    public get x() {
        return this.ix % 10;
    }
    /**
     * The Y axix on the board.
     */
    public get y() {
        return Math.floor(this.ix / 10);
    }

    /**
     * Goes up one cell.
     *
     * If there is no cell on top of it it returns `null`.
     */
    public get up() {
        try {
            return this.board.get(this.x, this.y - 1);
        } catch { return null; }
    }
    /**
     * Goes right one cell.
     *
     * If there is no cell right of it it returns `null`.
     */
    public get right() {
        try {
            return this.board.get(this.x + 1, this.y);
        } catch { return null; }
    }
    /**
     * Goes down one cell.
     *
     * If there is no cell below it it returns `null`.
     */
    public get down() {
        try {
            return this.board.get(this.x, this.y + 1);
        } catch { return null; }
    }
    /**
     * Goes left one cell.
     *
     * If there is no cell left of it it returns `null`.
     */
    public get left() {
        try {
            return this.board.get(this.x - 1, this.y);
        } catch { return null; }
    }

    /**
     * The next cell in the board. Similar to `right`, but if there is no more cell to go right, it goes down one row and returns the first one.
     *
     * If there is no next cell it returns `null`.
     */
    public get next() {
        try {
            return this.board.get(this.ix + 1);
        } catch { return null; }
    }
    /**
     * The previous cell in the board. Similar to `left`, but if there is no more cell to go left, it goes up one row and returns the last one.
     *
     * If there is no previous cell it returns `null`.
     */
    public get previous() {
        try {
            return this.board.get(this.ix - 1);
        } catch { return null; }
    }

    /**
     * Returns if the cell has the specified state.
     */
    public is(state: CellState) {
        return this.state == state;
    }

    /**
     * Moves into the specified direction `amount` times
     * @param direction The direction to move in.
     * @param amount The amount of moves.
     * @returns The resulting cell.
     */
    public move(direction: Direction, amount: number = 1) {
        if (amount < 1 || amount > 10) throw new Error("Count must be in between 1 and 10.");

        let curr: Cell<T> = this;
        while (amount && curr) {
            switch (direction) {
                case Direction.Up:
                    curr = curr.up;
                    break;
                case Direction.Right:
                    curr = curr.right;
                    break;
                case Direction.Down:
                    curr = curr.down;
                    break;
                case Direction.Left:
                    curr = curr.left;
                    break;
            }
            amount--;
        }

        return curr;
    }

    /**
     * Moves all the way in the specified direction.
     * @param direction The direction to move in.
     * @returns The found cell. (Never `null`)
     */
    public moveAll(direction: Direction) {
        switch (direction) {
            case Direction.Up:
                return this.board.get(this.x, 0);
            case Direction.Right:
                return this.board.get(9, this.y);
            case Direction.Down:
                return this.board.get(this.x, 9);
            case Direction.Left:
                return this.board.get(0, this.y);
        }
    }

    /**
     * Gets all the possible neighbours of this cell.
     * @param corners If it should include the corners.
     * @returns The found neighbours.
     */
    public neighbours(corners: boolean = false) {
        return [this.up, this.right, this.down, this.left].filter(Boolean)
            .concat(corners ? [this.up?.right, this.down?.right, this.down?.left, this.up?.left].filter(Boolean) : []);
    }

    toString() {
        return String.fromCharCode("A".charCodeAt(0) + this.x) + (this.y + 1);
    }
    valueOf() {
        return this.ix;
    }
}

/**
 * Represents one ship on a board.
 */
export class Ship<T = any> {
    /**
     * The board this ship is in.
     */
    public board: Board<T>;
    /**
     * The starting cell of the ship.
     */
    public cell: Cell<T>;
    /**
     * The length of the ship.
     */
    public length: number;
    /**
     * The direction the ship is oriented.
     */
    public direction: Direction;

    constructor(cell: Cell<T>, length: number, direction: Direction) {
        if (length < 1 || length > 10) throw new Error("Ship length must be in between 1 and 10.");

        this.board = cell.board;
        this.cell = cell;
        this.length = length;
        this.direction = direction;
    }

    /**
     * Returns all cells in this ship. `null` if it is invalid.
     */
    public getCells() {
        let length = this.length - 1;
        const cells: Cell<T>[] = [this.cell];
        let curr: Cell<T> = this.cell;
        while (length && curr) {
            length--;
            switch (this.direction) {
                case Direction.Up:
                    curr = curr.up;
                    break;
                case Direction.Right:
                    curr = curr.right;
                    break;
                case Direction.Down:
                    curr = curr.down;
                    break;
                case Direction.Left:
                    curr = curr.left;
                    break;
            }
            cells.push(curr);
        }
        if (!curr) return null;
        return cells;
    }

    /**
     * Copies the ship to a new board and returns the new ship.
     * @param newBoard The new board for the ship.
     */
    public copyToBoard<K = any>(newBoard: Board<K>): Ship<K> {
        return new Ship<K>(newBoard.get(this.cell.ix), this.length, this.direction);
    }

    /**
     * If this ship is sunken.
     */
    public isSunken() {
        return this.getCells()?.every(c => c.is(CellState.Ship) || c.is(CellState.Sunken));
    }
}
