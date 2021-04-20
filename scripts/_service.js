const player = require("./_loadPlayer");
const { _toIndexState, _parseIndex, Cell, CellState, Ship, Direction } = require("..");


const games = [];

// getReady operation
exports.getReady = (numberOfGames, success, error) => {
    // fill games
    for (let i = 0; i < numberOfGames; i++) {
        let instance;
        try {
            instance = new player("");
        }
        catch {
            // shouldn't happen after checks in _loadPlayer.js
            console.log(`ERROR`);
            error();
            process.exit(1);
        }
        games.push(instance);
    }
    success();
};


// getShots operation
exports.getShots = (data, success, error) => {
    const results = [];

    // go through every game passed
    for (const game of data) {
        // load player from list
        let gamePlayer = games.find(g => g.gameId == game.gameId);
        if (!gamePlayer) {
            // not initialized yet

            gamePlayer = games.find(g => g.gameId == "");
            if (gamePlayer) gamePlayer.gameId = game.gameId; // player left
            else {
                // no player left ERROR NOOOOO
                try {
                    gamePlayer = new player(game.gameId);
                }
                catch {
                    console.log(`ERROR`);
                    error();
                    process.exit(1);
                }
                games.push(gamePlayer);
            }
        }

        // update board
        const newStates = game.board.split("").map(c => _toIndexState(c));
        gamePlayer.board._field.forEach((c, i) => {
            c.state = newStates[i];
        });

        // register last shot (if there is one)
        if (game.lastShot && gamePlayer.registerShotContent) {
            const index = _parseIndex(game.lastShot);
            gamePlayer.lastShot = gamePlayer.board.get(index);
            const cell = gamePlayer.lastShot;

            // a ship has been sunken
            if (cell.is(CellState.Sunken)) {
                // calculate length
                const nextCell = cell.neighbours().find(n => n.is(CellState.Sunken));
                let firstCell = cell;
                let length = 1;
                let direction;
                if (nextCell == cell.up || nextCell == cell.down) {
                    // horizontal

                    let currentCell = cell;
                    while (currentCell && currentCell.is(CellState.Sunken)) {
                        length++;
                        currentCell = currentCell.down;
                    }
                    currentCell = cell;
                    while (currentCell && currentCell.is(CellState.Sunken)) {
                        length++;
                        firstCell = currentCell;
                        currentCell = currentCell.up;
                    }

                    direction = Direction.Down;
                }
                else {
                    // vertical

                    let currentCell = cell;
                    while (currentCell && currentCell.is(CellState.Sunken)) {
                        length++;
                        currentCell = currentCell.right;
                    }
                    currentCell = cell;
                    while (currentCell && currentCell.is(CellState.Sunken)) {
                        length++;
                        firstCell = currentCell;
                        currentCell = currentCell.left;
                    }

                    direction = Direction.Right;
                }

                // store it
                gamePlayer.board.leftShips.splice(gamePlayer.board.leftShips.indexOf(length));
                gamePlayer.board.sunkenShips.push(new Ship(firstCell, length, direction));
            }

            gamePlayer.registerShotContent(cell);
        }

        // calculate result
        const nextShot = gamePlayer.getNextShot();
        if (!(nextShot instanceof Cell) || nextShot.board != gamePlayer.board) {
            console.log("Player must return a cell in `getNextShot`");
            error();
            process.exit(1);
        }
        results.push(nextShot.toString());
    }

    success(results);
};
