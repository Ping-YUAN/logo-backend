export const STEP_MOVE = 'steps';

export const DIRECTION_CHANGE_RIGHT = 'right';
export const DIRECTION_CHANGE_LEFT = 'left';

export const DIRECTION_TOP = 'top';
export const DIRECTION_TOP_RIGHT = 'top_right';
export const DIRECTION_RIGHT = 'right';
export const DIRECTION_RIGHT_BOTTOM = 'right_bottom';
export const DIRECTION_BOTTOM = 'bottom';
export const DIRECTION_LEFT_BOTTOM = 'left_bottom';
export const DIRECTION_LEFT = 'left';
export const DIRECTION_LEFT_TOP = 'left_top';

export const DIRECTIONS_LIST = [
  DIRECTION_TOP,
  DIRECTION_TOP_RIGHT,
  DIRECTION_RIGHT,
  DIRECTION_RIGHT_BOTTOM,
  DIRECTION_BOTTOM,
  DIRECTION_LEFT_BOTTOM,
  DIRECTION_LEFT,
  DIRECTION_LEFT_TOP,
];

export type Direction = (typeof DIRECTIONS_LIST)[number];

export const TWO_PARAMETERS_COMMAND = [
  STEP_MOVE,
  DIRECTION_CHANGE_LEFT,
  DIRECTION_CHANGE_RIGHT,
];

export const BRUSH_MODE_HOVER = 'hover';
export const BRUSH_MODE_DRAW = 'draw';
export const BRUSH_MODE_ERASER = 'eraser';

export const BRUSH_MODE_LIST = [
  BRUSH_MODE_HOVER,
  BRUSH_MODE_DRAW,
  BRUSH_MODE_ERASER,
];
export type BrushMode = (typeof BRUSH_MODE_LIST)[number];

export const COORD = 'coord';

export const RENDER = 'render';

export const CLEAR = 'clear';

export const QUIT = 'quit';

export const SINGLE_PARAMETER_COMMAND = [
  BRUSH_MODE_HOVER,
  BRUSH_MODE_DRAW,
  BRUSH_MODE_ERASER,
  COORD,
  RENDER,
  CLEAR,
  QUIT,
];

export type LogoCanvas = string[][];

export type Cursor = {
  row: number;
  column: number;
};

export type LogoInstance = {
  canvas: LogoCanvas;
  mode: BrushMode;
  cursor: Cursor;
  direction: Direction;
  isRawSocket: boolean;
};

export type LogoInstances = {
  [key: string]: LogoInstance;
};
