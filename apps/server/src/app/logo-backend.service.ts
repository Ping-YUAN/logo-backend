import { Injectable } from '@nestjs/common';
import {
  BRUSH_MODE_DRAW,
  BRUSH_MODE_ERASER,
  BRUSH_MODE_HOVER,
  CLEAR,
  COORD,
  DIRECTIONS_LIST,
  DIRECTION_BOTTOM,
  DIRECTION_CHANGE_LEFT,
  DIRECTION_CHANGE_RIGHT,
  DIRECTION_LEFT,
  DIRECTION_LEFT_BOTTOM,
  DIRECTION_LEFT_TOP,
  DIRECTION_RIGHT,
  DIRECTION_RIGHT_BOTTOM,
  DIRECTION_TOP,
  DIRECTION_TOP_RIGHT,
  LogoInstance,
  QUIT,
  RENDER,
  SINGLE_PARAMETER_COMMAND,
  STEP_MOVE,
  TWO_PARAMETERS_COMMAND,
} from './model';
import { Socket } from 'socket.io';
import { Subject } from 'rxjs';

@Injectable()
export class LogoBackendService {
  quitSubject: Subject<Socket> = new Subject();
  constructor() {}

  getNewLogoInstance(height, width): LogoInstance {
    return {
      cursor: {
        row: 15,
        column: 15,
      },
      mode: BRUSH_MODE_DRAW,
      direction: DIRECTION_TOP,
      canvas: this.getEmptyCanvas(height, width),
      isRawSocket: false,
    };
  }

  getEmptyCanvas(height, width): string[][] {
    const result = new Array(height);
    for (let i = 0; i < height; i++) {
      result[i] = new Array(width).fill('');
    }
    return result;
  }

  parseCommand(command: string): string[][] {
    // skip all not valid command
    const commands: string[][] = command
      .split('\r\n')
      .filter((item) => item.length > 0)
      .map((item) => item.toLowerCase())
      .reduce((previousValue, currentValue) => {
        const commandParams = currentValue.split(' ').filter((item) => item);
        if (commandParams.length === 0) {
          return previousValue;
        }

        if (TWO_PARAMETERS_COMMAND.indexOf(commandParams[0]) > -1) {
          if (
            commandParams.length === 2 &&
            !isNaN(parseFloat(commandParams[1]))
          ) {
            previousValue.push([commandParams[0], commandParams[1]]);
          } else if (commandParams.length === 1) {
            // if command like right left or steps without any number then by default it would be 1
            previousValue.push([commandParams[0], 1]);
          }
        } else if (SINGLE_PARAMETER_COMMAND.indexOf(commandParams[0]) > -1) {
          previousValue.push([commandParams[0]]);
        }
        return previousValue;
      }, []);
    return commands;
  }

  executeCommands(
    commands: string[][],
    logoInstance: LogoInstance,
    client: Socket
  ) {
    commands.forEach((command) => {
      switch (command[0]) {
        case STEP_MOVE: {
          this.drawCurrentCoodinate(logoInstance);
          this.moveCursorByDirection(logoInstance, Number(command[1]));
          break;
        }
        case DIRECTION_CHANGE_LEFT:
        case DIRECTION_CHANGE_RIGHT: {
          const currentIdxOfDirection = DIRECTIONS_LIST.findIndex(
            (item) => item == logoInstance.direction
          );
          const directionMoveSteps = Number(command[1]);
          if (command[0] === DIRECTION_CHANGE_LEFT) {
            if (directionMoveSteps <= currentIdxOfDirection) {
              logoInstance.direction =
                DIRECTIONS_LIST[currentIdxOfDirection - directionMoveSteps];
            } else {
              logoInstance.direction =
                DIRECTIONS_LIST[
                  DIRECTIONS_LIST.length -
                    (directionMoveSteps - currentIdxOfDirection)
                ];
            }
          }

          if (command[0] === DIRECTION_CHANGE_RIGHT) {
            if (
              DIRECTIONS_LIST.length >
              directionMoveSteps + currentIdxOfDirection
            ) {
              logoInstance.direction =
                DIRECTIONS_LIST[currentIdxOfDirection + directionMoveSteps];
            } else {
              logoInstance.direction =
                DIRECTIONS_LIST[
                  (directionMoveSteps + currentIdxOfDirection) % 8
                ];
            }
          }

          break;
        }
        case BRUSH_MODE_HOVER:
        case BRUSH_MODE_ERASER:
        case BRUSH_MODE_DRAW: {
          logoInstance.mode = command[0];
          break;
        }
        case COORD: {
          client.send(
            JSON.stringify(
              `(${logoInstance.cursor.row},${logoInstance.cursor.column})`
            )
          );
          break;
        }
        case RENDER: {
          const canvasString = this.getCurrentCanvasString(logoInstance);
          client.send(JSON.stringify(canvasString));
          break;
        }
        case CLEAR: {
          const height = logoInstance.canvas.length;
          const width = logoInstance.canvas[0].length;
          logoInstance.canvas = this.getEmptyCanvas(height, width);
          break;
        }
        case QUIT: {
          this.quitSubject.next(client);
          break;
        }
        default: {
          if (!logoInstance.isRawSocket) {
            client.send(JSON.stringify('not a valid command'));
          }
        }
      }
    });
  }
  moveCursorByDirection(logoInstance: LogoInstance, steps: number) {
    let stopLoop = false;
    const cursor = logoInstance.cursor;
    for (let i = 0; i < steps; i++) {
      switch (logoInstance.direction) {
        case DIRECTION_TOP: {
          if (this.isMoveOutside(cursor.row - 1, cursor.column)) {
            stopLoop = true;
          } else {
            cursor.row -= 1;
          }
          break;
        }
        case DIRECTION_TOP_RIGHT: {
          if (this.isMoveOutside(cursor.row - 1, cursor.column + 1)) {
            stopLoop = true;
          } else {
            cursor.row -= 1;
            cursor.column += 1;
          }
          break;
        }
        case DIRECTION_RIGHT: {
          if (this.isMoveOutside(cursor.row, cursor.column + 1)) {
            stopLoop = true;
          } else {
            cursor.column += 1;
          }
          break;
        }
        case DIRECTION_RIGHT_BOTTOM: {
          if (this.isMoveOutside(cursor.row + 1, cursor.column + 1)) {
            stopLoop = true;
          } else {
            cursor.row += 1;
            cursor.column += 1;
          }
          break;
        }
        case DIRECTION_BOTTOM: {
          if (this.isMoveOutside(cursor.row + 1, cursor.column)) {
            stopLoop = true;
          } else {
            cursor.row += 1;
          }
          break;
        }
        case DIRECTION_LEFT_BOTTOM: {
          if (this.isMoveOutside(cursor.row + 1, cursor.column - 1)) {
            stopLoop = true;
          } else {
            cursor.row += 1;
            cursor.column -= 1;
          }
          break;
        }
        case DIRECTION_LEFT: {
          if (this.isMoveOutside(cursor.row, cursor.column - 1)) {
            stopLoop = true;
          } else {
            cursor.column -= 1;
          }
          break;
        }
        case DIRECTION_LEFT_TOP: {
          if (this.isMoveOutside(cursor.row - 1, cursor.column - 1)) {
            stopLoop = true;
          } else {
            cursor.row -= 1;
            cursor.column -= 1;
          }
        }
        default:
          break;
      }

      if (stopLoop) break;
    }
  }

  isMoveOutside(row, column): boolean {
    return row > 29 || row < 0 || column > 29 || column < 0;
  }

  drawCurrentCoodinate(logoInstance) {
    if (logoInstance.mode == BRUSH_MODE_ERASER) {
      logoInstance.canvas[logoInstance.cursor.row][logoInstance.cursor.column] =
        '';
    }

    if (logoInstance.mode == BRUSH_MODE_DRAW) {
      logoInstance.canvas[logoInstance.cursor.row][logoInstance.cursor.column] =
        '*';
    }
  }
  getCurrentCanvasString(logoInstance): string {
    let canvasString = '';
    const topBoundary =
      '\u2554' + '\u2550'.repeat(logoInstance.canvas[0].length) + '\u2557';
    const bottomBoundary =
      '\u255A' + '\u2550'.repeat(logoInstance.canvas[0].length) + '\u255D';
    canvasString += topBoundary + '\r\n';

    for (const row of logoInstance.canvas) {
      const rowFullfilSpace = row.map((item) => (item ? item : ' '));
      canvasString += '\u2551' + rowFullfilSpace.join('') + '\u2551' + '\r\n';
    }
    canvasString += bottomBoundary + '\r\n\r\n';
    return canvasString;
  }
}
