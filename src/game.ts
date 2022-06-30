// Gobblet Game Rules:  https://www.ultraboardgames.com/gobblet/game-rules.php
import * as _ from "lodash";

export enum Color {
  BLACK = 0,
  WHITE = 1,
}

export type PieceSize = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

export interface Piece {
  size: PieceSize;
  color: Color;
}

// (1,1) ~ (4,4)
interface Point {
  x: number;
  y: number;
}

export class Stack {
  protected pieces: Piece[] = [];

  get current() {
    return this.pieces[this.pieces.length - 1];
  }

  get all() {
    return this.pieces;
  }

  moveIn(piece: Piece) {
    if (this.pieces.length === 0 || this.current.size < piece.size) {
      this.pieces.push(piece);
      return this;
    }
    throw new Error("The piece cannot fit in the stack!");
  }

  moveOut() {
    return this.pieces.pop();
  }
}

export class ExternalStack extends Stack {
  constructor(pieces: PieceSize[], color: Color) {
    super();
    for (const size of pieces) {
      this.pieces.push({ size, color });
    }
  }
}

export interface BoardData {
  archivedBoard?: Stack[];
  turnTo?: Color;
  externalStacks: ExternalStack[]; // 0~2: black, 3~5: white
}

export class Board {
  protected realtimeBoard: Stack[];
  protected turnState: Color;
  protected externalStacks: ExternalStack[];

  constructor(board: BoardData) {
    if (board.archivedBoard) {
      this.realtimeBoard = board.archivedBoard;
    } else {
      // init empty board
      this.realtimeBoard = [];
      for (let i = 0; i < 16; i++) {
        this.realtimeBoard.push(new Stack());
      }
    }

    this.turnState = board.turnTo || Color.BLACK;

    this.checkExternalStacks(board.externalStacks);

    this.externalStacks = board.externalStacks;
  }

  /**
   * Move a piece to another grid of the board.
   * @param from The source of piece which you wanna move:
   *             `Point` for a piece on board;
   *             `Stack` for a piece in external stacks.
   * @param to The target point of grid on the board.
   * @returns The updated board.
   */
  move(from: Point | Stack, to: Point) {
    try {
      if ("x" in from) {
        this.movePieceOnGrid(from, to);
      } else {
        this.movePieceFromExternalStacks(from, to);
      }
      this.turnTo = this.turnTo === Color.BLACK ? Color.WHITE : Color.BLACK;
    } catch (error) {
      if (error instanceof Error)
        throw new Error("CannotMovePiece", { cause: error });
    }
    return this;
  }

  /**
   * Move an external piece to grid.
   * @param from The external stack where the piece is.
   * @param to The target point of grid on the board.
   * @returns The updated board.
   */
  movePieceFromExternalStacks(from: Stack, to: Point) {
    if (this.externalStacks.indexOf(from) === -1)
      throw new Error("Cannot find the stack.");

    const targetGrid = this.findGridByPoint(to);
    if (!targetGrid)
      throw new Error(`Target grid at (${to.x}, ${to.y}) does not exist.`);

    if (from.current.color !== this.turnTo)
      throw new Error(`It's not ${from.current.color}'s turn yet.`);

    const p = from.moveOut();
    if (p) targetGrid.moveIn(p);
    return this;
  }

  /**
   * Move a piece on board to another grid.
   * @param from The point of grid which the piece you wanna move is.
   * @param to The target point of grid on the board.
   * @returns The updated board.
   */
  movePieceOnGrid(from: Point, to: Point) {
    const targetGrid = this.findGridByPoint(to);
    if (!targetGrid)
      throw new Error(`Target grid at (${to.x}, ${to.y}) does not exist.`);

    const grid = this.findGridByPoint(from);
    if (grid.current.color !== this.turnTo)
      throw new Error(`Cannot move opponent's piece.`);

    const piece = grid.moveOut();
    if (!piece)
      throw new Error(`There's no piece at the grid (${to.x}, ${to.y}).`);

    targetGrid.moveIn(piece);
    return this;
  }

  /**
   * Do we have a WINNER?
   * @returns `Color` enum of the winner, or `null` when no winner.
   */
  checkForWinner(): Color | null {
    const wins = [
      0x55000000, 0x550000, 0x5500, 0x55, 0x40404040, 0x10101010, 0x4040404,
      0x1010101, 0x1041040, 0x40100401,
    ];
    for (const w of wins) {
      if ((w & this.hexSnapshot) === w) {
        return Color.BLACK;
      } else if (((w << 1) & this.hexSnapshot) === w << 1) {
        return Color.WHITE;
      }
    }
    return null;
  }

  get board() {
    return this.realtimeBoard;
  }

  get turnTo() {
    return this.turnState;
  }

  protected set turnTo(color: Color) {
    this.turnState = color;
  }

  /**
   * Current state on the board. Only the piece on top.
   */
  get snapshot(): Piece[] {
    const snapshot: Piece[] = [];
    for (const grid of this.realtimeBoard) {
      snapshot.push(grid.current);
    }
    return snapshot;
  }

  /**
   * Using binary to show the current state on the board.
   *
   * Two bits for a grid: `00` - no piece; `01` - black piece; `10` - white piece; `11` - shouldn't exist.
   */
  get hexSnapshot(): number {
    let tmp = 0x0;
    for (const piece of this.snapshot) {
      tmp <<= 2;
      if (piece) tmp += piece.color + 1;
    }
    return tmp;
  }

  get blackExternalStacks(): ExternalStack[] {
    return [
      this.externalStacks[0],
      this.externalStacks[1],
      this.externalStacks[2],
    ];
  }

  get whiteExternalStacks(): ExternalStack[] {
    return [
      this.externalStacks[3],
      this.externalStacks[4],
      this.externalStacks[5],
    ];
  }

  protected findGridByPoint(point: Point): Stack {
    const { x, y } = point;
    if (x < 1 || x > 4 || y < 1 || y > 4) {
      throw new Error(`The point (${x},${y}) is out of range of board!`);
    }
    const index = (y - 1) * 4 + (x - 1);
    const grid = this.realtimeBoard[index];
    if (!grid) {
      throw new Error(`#realtimeBoard[${index}] does not exist!`);
    }
    return grid;
  }

  protected checkExternalStacks(stacks: Stack[]) {
    const coloredChunks = _.chunk(stacks, 3);
    for (const chunks of coloredChunks) {
      const allPieces = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      let count = 12;
      for (let i = 0; i < 3; i++) {
        const pieces = chunks[i].all;
        for (const piece of pieces) {
          if (allPieces.includes(piece.size)) {
            count--;
          } else {
            throw new Error(
              `Found an illegal piece ${JSON.stringify(
                piece
              )} from external stacks.`
            );
          }
        }
      }
      if (count > 0) {
        throw new Error(
          `Found ${-count} more piece(s) in external stacks of ${
            chunks[0].current.color === Color.BLACK ? "BLACK" : "WHITE"
          }.`
        );
      } else if (count < 0) {
        throw new Error(
          `Missing ${count} piece(s) in external stacks of ${
            chunks[0].current.color === Color.BLACK ? "BLACK" : "WHITE"
          }.`
        );
      }
    }
    return true;
  }
}
