import {Enum} from '../utils'

let KeyCodes = new Enum.EnumGenerator();

export const MOUSE_RIGHT = KeyCodes.value;
export const MOUSE_LEFT = KeyCodes.next();
export const MOUSE_WHEEL = KeyCodes.next();

export const CARDBOARD_TRIGGER = KeyCodes.next();