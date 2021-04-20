import { CellState } from "./board";

/**
 * Turns a char into a CellState.
 * @param char The specified char.
 * @returns The converted CellState.
 * @private
 */
export function _toIndexState(char: " " | "W" | "H" | "X") {
    return {
        " ": CellState.Unknown,
        "W": CellState.Water,
        "H": CellState.Ship,
        "X": CellState.Sunken,
    }[char];
}

export function _parseIndex(ix: string) {
    return (ix.toUpperCase().charCodeAt(0) - "A".charCodeAt(0)) + (parseInt(ix.charAt(1) + (ix.charAt(2) || "")) - 1) * 10;
}
