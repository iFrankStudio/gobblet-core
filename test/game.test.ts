import { expect, test } from "vitest";
import {
  Board,
  Color,
  Stack,
  Piece,
} from "../src/game";

const game = new Board();

test("start a new game", () => {
  const boards: Stack[] = [];
  for (let i = 0; i < 16; i++) {
    boards.push(new Stack());
  }
  expect(game.board).toEqual(boards);
  expect(game.hexSnapshot).toBe(0);
});

test("play to win", () => {
  const boards: Stack[] = [];
  for (let i = 0; i < 16; i++) {
    boards.push(new Stack());
  }
  let pointedPiece: Piece;
  // black 12 to (1,1)
  pointedPiece = game.blackExternalStacks[2].current;
  game.move(game.blackExternalStacks[2], { x: 1, y: 1 });
  boards[0].moveIn(pointedPiece);
  expect(game.board).toEqual(boards);
  expect(game.hexSnapshot).toBe(0x40000000);
  expect(game.turnTo).toBe(Color.WHITE);
  expect(game.checkForWinner()).toBe(null);
  // white 12 to (4,4)
  pointedPiece = game.whiteExternalStacks[0].current;
  game.move(game.whiteExternalStacks[0], { x: 4, y: 4 });
  boards[15].moveIn(pointedPiece);
  expect(game.board).toEqual(boards);
  expect(game.hexSnapshot).toBe(0x40000002);
  expect(game.turnTo).toBe(Color.BLACK);
  expect(game.checkForWinner()).toBe(null);
  // black 4 to (1,2)
  pointedPiece = game.blackExternalStacks[0].current;
  game.move(game.blackExternalStacks[0], { x: 1, y: 2 });
  boards[4].moveIn(pointedPiece);
  expect(game.board).toEqual(boards);
  expect(game.hexSnapshot).toBe(0x40400002);
  expect(game.turnTo).toBe(Color.WHITE);
  expect(game.checkForWinner()).toBe(null);
  // white 10 to (3, 2)
  pointedPiece = game.whiteExternalStacks[1].current;
  game.move(game.whiteExternalStacks[1], { x: 3, y: 2 });
  boards[6].moveIn(pointedPiece);
  expect(game.board).toEqual(boards);
  expect(game.hexSnapshot).toBe(0x40480002);
  expect(game.turnTo).toBe(Color.BLACK);
  expect(game.checkForWinner()).toBe(null);
  // black 3 to (1,4)
  pointedPiece = game.blackExternalStacks[0].current;
  game.move(game.blackExternalStacks[0], { x: 1, y: 4 });
  boards[12].moveIn(pointedPiece);
  expect(game.board).toEqual(boards);
  expect(game.hexSnapshot).toBe(0x40480042);
  expect(game.turnTo).toBe(Color.WHITE);
  expect(game.checkForWinner()).toBe(null);
  // white 7 to (2,4)
  pointedPiece = game.whiteExternalStacks[1].current;
  game.move(game.whiteExternalStacks[1], { x: 2, y: 4 });
  boards[13].moveIn(pointedPiece);
  expect(game.board).toEqual(boards);
  expect(game.hexSnapshot).toBe(0x40480062);
  expect(game.turnTo).toBe(Color.BLACK);
  expect(game.checkForWinner()).toBe(null);
  // black 11 to (1,3)
  pointedPiece = game.blackExternalStacks[2].current;
  game.move(game.blackExternalStacks[2], { x: 1, y: 3 });
  boards[8].moveIn(pointedPiece);
  expect(game.board).toEqual(boards);
  expect(game.hexSnapshot).toBe(0x40484062);
  expect(game.turnTo).toBe(Color.WHITE);
  expect(game.checkForWinner()).toBe(Color.BLACK);
});
