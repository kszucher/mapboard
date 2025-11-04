export type M = {
  n: Node[]
  e: Edge[],
};

export type Node = {
  id: number;
  workspaceId: number | null;
  iid: number;
  offsetX: number;
  offsetY: number;
  isProcessing: boolean;
  nodeTypeId: number;
  updatedAt: Date;
};

export type NodeType = {
  id: number;
  w: number;
  h: number;
  color: Color;
  label: string;
}

export type Attribute = {
  id: number;
  value: string | null;
}

export type AttributeCreate = Pick<Attribute,
  'value'>

export type AttributeType = {
  id: number;
  nodeTypeId: number | null;
  label: string;
  isInput: boolean;
  isString: boolean;
  isNumber: boolean;
  isEnum: boolean;
  defaultString: string | null;
  defaultNumber: number | null;
  defaultEnum: string[];
}

export type AttributeTypeUpdate = Required<Omit<AttributeType, 'id'>>

export type Edge = {
  id: number;
  workspaceId: number | null;
  fromNodeId: number;
  toNodeId: number;
  lineColor: string;
  lineWidth: number;
  FromNode: {
    id: number;
    offsetX: number;
    offsetY: number;
    NodeType: {
      id: number;
    }
  },
  ToNode: {
    id: number;
    offsetX: number;
    offsetY: number;
    NodeType: {
      id: number;
    }
  }
  updatedAt: Date;
}

export type Share = {
  id: number
  mapId: number
  access: string
  status: string
  Map: {
    name: string
  }
  ShareUser: {
    email: string
  }
  OwnerUser: {
    email: string
  }
}

export const ShareStatus = {
  WAITING: 'WAITING',
  ACCEPTED: 'ACCEPTED',
} as const;

export type ShareStatus = (typeof ShareStatus)[keyof typeof ShareStatus];

export const ShareAccess = {
  VIEW: 'VIEW',
  EDIT: 'EDIT',
} as const;

export type ShareAccess = (typeof ShareAccess)[keyof typeof ShareAccess];

export const ColorMode = {
  DARK: 'DARK',
  LIGHT: 'LIGHT',
} as const;

export type ColorMode = (typeof ColorMode)[keyof typeof ColorMode];

export const Color = {
  gray: 'gray',
  gold: 'gold',
  bronze: 'bronze',
  brown: 'brown',
  yellow: 'yellow',
  amber: 'amber',
  orange: 'orange',
  tomato: 'tomato',
  red: 'red',
  ruby: 'ruby',
  crimson: 'crimson',
  pink: 'pink',
  plum: 'plum',
  purple: 'purple',
  violet: 'violet',
  iris: 'iris',
  indigo: 'indigo',
  blue: 'blue',
  cyan: 'cyan',
  teal: 'teal',
  jade: 'jade',
  green: 'green',
  grass: 'grass',
  lime: 'lime',
  mint: 'mint',
  sky: 'sky',
} as const;

export type Color = (typeof Color)[keyof typeof Color];
