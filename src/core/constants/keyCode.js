import {Enum} from '../utils'

let KeyCodes = new Enum.EnumGenerator();

export const MOUSE_RIGHT = KeyCodes.value;
export const MOUSE_LEFT = KeyCodes.next();
export const MOUSE_WHEEL = KeyCodes.next();

export const CARDBOARD_TRIGGER = KeyCodes.next();

export const VIVE_LEFT_TRACKPAD = KeyCodes.next();
export const VIVE_LEFT_MENU = KeyCodes.next();
export const VIVE_LEFT_TRIGGER = KeyCodes.next();
export const VIVE_LEFT_GRIP = KeyCodes.next();
export const VIVE_RIGHT_TRACKPAD = KeyCodes.next();
export const VIVE_RIGHT_MENU = KeyCodes.next();
export const VIVE_RIGHT_TRIGGER = KeyCodes.next();
export const VIVE_RIGHT_GRIP = KeyCodes.next();