import {Button} from './Button';
import {Joystick} from './Joystick';
import * as CONST from '../constants';

export const viveLeftTrackpad = new Joystick(CONST.VIVE_LEFT_TRACKPAD);
export const viveLeftTrigger = new Button(CONST.VIVE_LEFT_TRIGGER);
export const viveLeftGrip = new Button(CONST.VIVE_LEFT_GRIP);
export const viveLeftMenu = new Button(CONST.VIVE_LEFT_MENU);

export const viveRightTrackpad = new Joystick(CONST.VIVE_RIGHT_TRACKPAD);
export const viveRightTrigger = new Button(CONST.VIVE_RIGHT_TRIGGER);
export const viveRightGrip = new Button(CONST.VIVE_RIGHT_GRIP);
export const viveRightMenu = new Button(CONST.VIVE_RIGHT_MENU);