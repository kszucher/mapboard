export enum DialogState {
  NONE,
  EDIT_CONTENT_EQUATION,
  CREATE_TABLE_O,
  CREATE_MAP_IN_MAP,
  RENAME_MAP,
}

export enum NodeMode {
  VIEW = 'View',
  EDIT_LINE = 'Edit Line',
  EDIT_ROOT = 'Edit Root',
  EDIT_STRUCT = 'Edit Struct',
  EDIT_CELL = 'Edit Cell',
  EDIT_CELL_ROW = 'Edit Cell Row',
  EDIT_CELL_COLUMN = 'Edit Cell Column'
}

export enum LeftMouseMode {
  CLICK_SELECT = 'clickSelect',
  CLICK_SELECT_AND_MOVE = 'clickSelectAndMove',
  RECTANGLE_SELECT = 'rectangleSelect',
}

export enum MidMouseMode {
  SCROLL = 'scroll',
  ZOOM = 'zoom'
}

export enum FormatMode {
  text,
  sBorder,
  fBorder,
  sFill,
  fFill,
  line
}

export enum TextType {
  h1 = 36,
  h2 = 24,
  h3 = 18,
  h4 = 16,
  t = 14
}

export enum WidthType {
  w0 = 0,
  w1 = 1,
  w2,
  w3
}

export enum LineType {
  bezier,
  edge
}

export enum Side {
  L = 'left',
  R = 'right',
  T = 'top',
  B = 'bottom',
}

export enum ControlType {
  NONE = '',
}

export enum Flow {
  EXPLODED = 'exploded',
  INDENTED = 'indented'
}
