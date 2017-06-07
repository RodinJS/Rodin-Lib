import {Enum} from '../utils'

let KeyCodes = new Enum.EnumGenerator();

export const MOUSE_RIGHT = KeyCodes.value;
export const MOUSE_LEFT = KeyCodes.next();
export const MOUSE_WHEEL = KeyCodes.next();

export const CARDBOARD_TRIGGER = KeyCodes.next();

export const VIVE_LEFT_TOUCHPAD = KeyCodes.next();
export const VIVE_LEFT_MENU = KeyCodes.next();
export const VIVE_LEFT_TRIGGER = KeyCodes.next();
export const VIVE_LEFT_GRIP = KeyCodes.next();
export const VIVE_RIGHT_TOUCHPAD = KeyCodes.next();
export const VIVE_RIGHT_MENU = KeyCodes.next();
export const VIVE_RIGHT_TRIGGER = KeyCodes.next();
export const VIVE_RIGHT_GRIP = KeyCodes.next();

export const OCULUS_TOUCH_X = KeyCodes.next();
export const OCULUS_TOUCH_Y = KeyCodes.next();
export const OCULUS_TOUCH_LEFT_THUMBSTICK = KeyCodes.next();
export const OCULUS_TOUCH_LEFT_GRIP = KeyCodes.next();
export const OCULUS_TOUCH_LEFT_TRIGGER = KeyCodes.next();

export const OCULUS_TOUCH_A = KeyCodes.next();
export const OCULUS_TOUCH_B = KeyCodes.next();
export const OCULUS_TOUCH_RIGHT_THUMBSTICK = KeyCodes.next();
export const OCULUS_TOUCH_RIGHT_GRIP = KeyCodes.next();
export const OCULUS_TOUCH_RIGHT_TRIGGER = KeyCodes.next();

export const DAYDREAM_TRIGGER = KeyCodes.next();