import {Button} from './Button';
import {Joystick} from './Joystick';
import * as CONST from '../constants';

export const oculusTouchX = new Button(CONST.OCULUS_TOUCH_X);
export const oculusTouchY = new Button(CONST.OCULUS_TOUCH_Y);
export const oculusTouchLeftThumbstick = new Joystick(CONST.OCULUS_TOUCH_LEFT_THUMBSTICK);
export const oculusTouchLeftGrip = new Button(CONST.OCULUS_TOUCH_LEFT_GRIP);
export const oculusTouchLeftTrigger = new Button(CONST.OCULUS_TOUCH_LEFT_TRIGGER);

export const oculusTouchA = new Button(CONST.OCULUS_TOUCH_A);
export const oculusTouchB = new Button(CONST.OCULUS_TOUCH_B);
export const oculusTouchRightThumbstick = new Joystick(CONST.OCULUS_TOUCH_RIGHT_THUMBSTICK);
export const oculusTouchRightGrip = new Button(CONST.OCULUS_TOUCH_RIGHT_GRIP);
export const oculusTouchRightTrigger = new Button(CONST.OCULUS_TOUCH_RIGHT_TRIGGER);