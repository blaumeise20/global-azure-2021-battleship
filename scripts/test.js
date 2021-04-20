const { Board, CellState, _parseIndex, Ship, Direction } = require("..");
const { getReady, getShots } = require("./_service");

// official ships like https://github.com/rstropek/BattleshipContestFunc/wiki/Game-Rules#general-rules
const SHIPS = [2, 3, 3, 4, 5];
const TOTAL_BOAT_LENGTH = SHIPS.reduce((a, b) => a + b);

(async() => {

// !function(a,b,c,d,e,f,g,h,i){function j(a){var b,c=a.length,e=this,f=0,g=e.i=e.j=0,h=e.S=[];for(c||(a=[c++]);d>f;)h[f]=f++;for(f=0;d>f;f++)h[f]=h[g=s&g+a[f%c]+(b=h[f])],h[g]=b;(e.g=function(a){for(var b,c=0,f=e.i,g=e.j,h=e.S;a--;)b=h[f=s&f+1],c=c*d+h[s&(h[f]=h[g=s&g+b])+(h[g]=b)];return e.i=f,e.j=g,c})(d)}function k(a,b){var c,d=[],e=typeof a;if(b&&"object"==e)for(c in a)try{d.push(k(a[c],b-1))}catch(f){}return d.length?d:"string"==e?a:a+"\0"}function l(a,b){for(var c,d=a+"",e=0;e<d.length;)b[s&e]=s&(c^=19*b[s&e])+d.charCodeAt(e++);return n(b)}function m(c){try{return o?n(o.randomBytes(d)):(a.crypto.getRandomValues(c=new Uint8Array(d)),n(c))}catch(e){return[+new Date,a,(c=a.navigator)&&c.plugins,a.screen,n(b)]}}function n(a){return String.fromCharCode.apply(0,a)}var o,p=c.pow(d,e),q=c.pow(2,f),r=2*q,s=d-1,t=c["seed"+i]=function(a,f,g){var h=[];f=1==f?{entropy:!0}:f||{};var o=l(k(f.entropy?[a,n(b)]:null==a?m():a,3),h),s=new j(h);return l(n(s.S),b),(f.pass||g||function(a,b,d){return d?(c[i]=a,b):a})(function(){for(var a=s.g(e),b=p,c=0;q>a;)a=(a+c)*d,b*=d,c=s.g(1);for(;a>=r;)a/=2,b/=2,c>>>=1;return(a+c)/b},o,"global"in f?f.global:this==c)};if(l(c[i](),b),g&&g.exports){g.exports=t;try{o=require("crypto")}catch(u){}}else h&&h.amd&&h(function(){return t})}(this,[],Math,256,6,52,"object"==typeof module&&module,"function"==typeof define&&define,"random");
// Math.seedrandom("haejwahflwej");

// start games
const gameCount = Number(process.argv[4]) || 500;
getReady(gameCount, () => null, () => null);
const gameShots = [];

console.log("\u001b[32mGames started.\u001b[0m");
process.stdout.write("\n\n\n\n\n");
process.stdout.write("\u001b[A\u001b[A\u001b[A\u001b[A\u001b[A\u001b[s");
print(0, [0], false, false);

// do games
gameLoop: for (let i = 0; i < gameCount; i++) {
    // initialize game
    let shots = 0;
    let lastShot = null;
    let done = false;
    const shotsArr = [];
    const gameId = i.toString();
    const board = new Board(CellState.Water); // actual board with ships
    const shootingBoard = new Board(); // shooting board
    const ships = [];

    // fill board
    // (almost) copied from https://github.com/rstropek/NBattleshipCodingContest/blob/master/NBattleshipCodingContest.Logic/RandomBoardFiller.cs#L44
    // copied to have the same board construction like in the contest https://globalazure.at/battleship/
    shipPlacer: for (const shipLength of SHIPS) {
        for (let attemptsLeft = 1000; attemptsLeft > 0; attemptsLeft--) {
            const direction = Math.floor(Math.random() * 2) == 0 ? Direction.Right : Direction.Down;
            const cell = board.get(
                Math.floor(Math.random() * (10 - (direction == Direction.Right ? shipLength : 0))),
                Math.floor(Math.random() * (10 - (direction == Direction.Down ? shipLength : 0)))
            );
            const ship = new Ship(cell, shipLength, direction);
            if (board.canPlaceShip(ship, true)) {
                // ok, place ship
                ship.getCells().forEach(c => {
                    c.state = CellState.Ship;
                });
                ships.push(ship.copyToBoard(shootingBoard));

                continue shipPlacer;
            }
        }
        i--;
        continue gameLoop;
    }

    // run game
    while (!done && shots < 100) {
        shots++;

        getShots([
            {
                lastShot,
                gameId,
                board: shootingBoard._field.map(x => ([" ", "W", "H", "X"][x.state])).join("")
            }
        ], data => {
            // store shot
            shotsArr.push(data[0]);
            lastShot = data[0];

            const ix = _parseIndex(data[0]);
            shootingBoard._field[ix].state = board._field[ix].state;

            // sink sunken ships (weird sentence i know)
            ships.filter(s => s.isSunken()).forEach(s => s.getCells().forEach(c => c.state = CellState.Sunken));

            // stop if done
            const count = shootingBoard._field.filter(c => c.is(CellState.Sunken)).length;
            if (count == TOTAL_BOAT_LENGTH) done = true;
        }, () => null);

        // // get shot
        // const shot = currentPlayer.getNextShot();
        // shotsArr.push(shot);
        // currentPlayer.lastShot = shot;
        // const content = board.get(shot);

        // // register new shot
        // currentPlayer.board._field[shot.valueOf()] = content;
        // if (currentPlayer.registerShotContent) currentPlayer.registerShotContent(shot, content);

        // // stop game if done
        // if (currentPlayer.board._field.filter(x => x == CellState.Ship || x == CellState.Sunken).length == TOTAL_BOAT_LENGTH) break;
    }

    gameShots.push(shots);

    print(i + 1, gameShots, i != gameCount - 1);
}


// print results
function print(num, gameShots, save = true, restore = true) {
    process.stdout.write((restore ? "\u001b[u" : "") + (save ? "\u001b[s" : ""));
    process.stdout.write(`\u001b[2K\u001b[1mGames completed:\u001b[0m ${num}\n`);
    process.stdout.write(`\u001b[2K\u001b[1mAverage shots:\u001b[0m \u001b[35;1m${gameShots.reduce((a, b) => a + b) / gameShots.length}\u001b[0m\n`);
    process.stdout.write(`\u001b[2K\u001b[1mMinimum shots:\u001b[0m \u001b[35m${Math.min(...gameShots)}\u001b[0m\n`);
    process.stdout.write(`\u001b[2K\u001b[1mMaximum shots:\u001b[0m \u001b[35m${Math.max(...gameShots)}\u001b[0m\n`);
    process.stdout.write(`\u001b[2K\u001b[1mStandard deviation:\u001b[0m \u001b[35m${calcStdDev(gameShots)}\u001b[0m\n`);
}
function calcStdDev(nums) {
    // https://www.mathsisfun.com/data/standard-deviation-formulas.html
    const mean = nums.reduce((a, b) => a + b) / nums.length;
    const newNums = nums.map(n => Math.pow(n - mean, 2));
    const newMean = newNums.reduce((a, b) => a + b) / newNums.length;
    return Math.sqrt(newMean);
}

function wait(time) { return new Promise(r => setTimeout(r, time)) }

})()
