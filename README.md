# Global Azure Austria 2021 - Battleship coding contest

DESCRIPTION

# Installation

Just run this command:
```
npm install --save global-azure-2021-battleship
```
And add these two scripts to your package.json:
```json
"scripts": {
  "start": "gaa-battleship start dist/index.js",
  "test": "gaa-battleship test dist/index.js"
}
```
The package is written for use with TypeScript, so in these scripts the compiled files are specified. If you don't use TypeScript, you can change the paths to match your file.

# Usage

The file must export a class derived from the base player class provided in this package. It looks like this:
```ts
import { Player } from "global-azure-2021-battleship";

export = class CoolPlayer extends Player {
    // it is possible to store custom state here

    getNextShot() {
        return Math.floor(Math.random() * 100); // don't do this!!! only an example
    }
    registerShotContent(cell: Cell) { // optional
        // do something
    }
};
```
You have the last shot and the board also stored in the player.

-----

The scripts are made to run and test the players. With `start` you start an express server according to the [specification](https://github.com/rstropek/BattleshipContestFunc/wiki/Player-Web-API) with default port 8012, but by setting the env variable `PORT` or passing a second argument you can specify another port like this:
```jsonc
"start": "gaa-battleship start dist/index.js 1234"
// or
"start": "PORT=1234 gaa-battleship start dist/index.js"
```
The `test` script will run the player locally 500 times and calculate the average shots until all boats are sunken. You can also specify the amount of games:
```jsonc
"test": "gaa-battleship test dist/index.js 50"
```
If you get the error `ERROR SHOULD NEVER HAPPEN board to full try again`, that is a rare case in one of a few thousand games that the board filling didn't work. Just ignore it and try again.

There will possibly be an interactive version in Global Azure Austria 2022 :-)

# Licence
This project is licenced under the MIT licence. Read it [here](LICENCE).
