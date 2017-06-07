import {Button} from './Button';
import {Joystick} from './Joystick';
import * as CONST from '../constants';

export const viveLeftTouchpad = new Joystick(CONST.VIVE_LEFT_TOUCHPAD);
export const viveLeftTrigger = new Button(CONST.VIVE_LEFT_TRIGGER);
export const viveLeftGrip = new Button(CONST.VIVE_LEFT_GRIP);
export const viveLeftMenu = new Button(CONST.VIVE_LEFT_MENU);

export const viveRightTouchpad = new Joystick(CONST.VIVE_RIGHT_TOUCHPAD);
export const viveRightTrigger = new Button(CONST.VIVE_RIGHT_TRIGGER);
export const viveRightGrip = new Button(CONST.VIVE_RIGHT_GRIP);
export const viveRightMenu = new Button(CONST.VIVE_RIGHT_MENU);