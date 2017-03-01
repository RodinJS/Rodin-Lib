/*****************************************************************************************

The MIT License

Copyright (c) 2010-2012 Tween.js authors.

Easing equations Copyright (c) 2001 Robert Penner http://robertpenner.com/easing/

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

*****************************************************************************************/

/**
 * Tween.js - Licensed under the MIT license
 * https://github.com/tweenjs/tween.js
 * ----------------------------------------------
 *
 * See https://github.com/tweenjs/tween.js/graphs/contributors for the full list of contributors.
 * Thank you all, you're awesome!
 */

import * as CONSTANTS from '../constants';
import {EventEmitter} from '../eventEmitter';
import {RodinEvent} from '../rodinEvent';
import {Time} from '../time';

export class Tween extends EventEmitter {
 	constuctor(object) {
		this._object = object;
		this._valuesStart = {};
		this._valuesEnd = {};
		this._valuesStartRepeat = {};
		this._duration = 1000;
		this._repeat = 0;
		this._yoyo = false;
		this._isPlaying = false;
		this._reversed = false;
		this._delayTime = 0;
		this._startTime = null;
		this._easingFunction = TWEEN.Easing.Linear.None;
		this._interpolationFunction = TWEEN.Interpolation.Linear;
		this._chainedTweens = [];
		this._onStartCallback = null;
		this._onStartCallbackFired = false;
		this._onUpdateCallback = null;
		this._onCompleteCallback = null;
		this._onStopCallback = null;

		for (let field in object) {
			_valuesStart[field] = parseFloat(object[field], 10);
		}
 	}

	to(properties, duration) {
		if (duration !== undefined) {
			this._duration = duration;
		}

		this._valuesEnd = properties;
	}

	start(time) {
		this._isPlaying = true;

		this._onStartCallbackFired = false;

		this._startTime = time !== undefined ? time : Time.now();
		this._startTime += this._delayTime;

		for (let property in this._valuesEnd) {

			// Check if an Array was provided as property value
			if (this._valuesEnd[property] instanceof Array) {
				if (this._valuesEnd[property].length === 0) {
					continue;
				}

				// Create a local copy of the Array with the start value at the front
				this._valuesEnd[property] = [this._object[property]].concat(this._valuesEnd[property]);
			}

			// If `to()` specifies a property that doesn't exist in the source object,
			// we should not set that property in the object
			if (this._valuesStart[property] === undefined) {
				continue;
			}

			this._valuesStart[property] = this._object[property];

			if ((this._valuesStart[property] instanceof Array) === false) {
				this._valuesStart[property] *= 1.0; // Ensures we're using numbers, not strings
			}

			this._valuesStartRepeat[property] = this._valuesStart[property] || 0;
		}
		return this;
	}

	stop() {
		if (!this._isPlaying) {
			return this;
		}

		this._isPlaying = false;

		this.emit(CONSTANTS.STOP, new RodinEvent(null, {values: this}));

		this.stopChainedTweens();
		return this;
	}

	stopChainedTweens() {
		for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
			this._chainedTweens[i].stop();
		}
	}

	delay(amount) {
		this._delayTime = amount;
		return this;
	}

	repeat(times) {
		this._repeat = times;
		return this;
	}

	yoyo(yoyo) {
		this._yoyo = yoyo;
		return this;
	}


	easing(easing) {
		this._easingFunction = easing;
		return this;
	}

	interpolation(interpolation) {
		this._interpolationFunction = interpolation;
		return this;
	}

	chain() {
		this._chainedTweens = arguments;
		return this;
	}

	update(time) {

		let property;
		let elapsed;
		let value;

		if (time < this._startTime) {
			return true;
		}

		if (this._onStartCallbackFired === false) {
			this.emit(CONSTANTS.START, new RodinEvent(null, {values: this}));

			this._onStartCallbackFired = true;
		}

		elapsed = (time - this._startTime) / this._duration;
		elapsed = elapsed > 1 ? 1 : elapsed;

		value = this._easingFunction(elapsed);

		for (property in this._valuesEnd) {
			// Don't update properties that do not exist in the source object
			if (this._valuesStart[property] === undefined) {
				continue;
			}

			let start = this._valuesStart[property] || 0;
			let end = this._valuesEnd[property];

			if (end instanceof Array) {
				this._object[property] = _interpolationFunction(end, value);
			} else {
				// Parses relative end values with start as base (e.g.: +10, -3)
				if (typeof (end) === 'string') {

					if (end.charAt(0) === '+' || end.charAt(0) === '-') {
						end = start + parseFloat(end, 10);
					} else {
						end = parseFloat(end, 10);
					}
				}

				// Protect against non numeric properties.
				if (typeof (end) === 'number') {
					this._object[property] = start + (end - start) * value;
				}
			}
		}

		this.emit(CONSTANTS.UPDATE, new RodinEvent(null, {values: this}));

		if (elapsed === 1) {

			if (this._repeat > 0) {
				if (isFinite(this._repeat)) {
					this._repeat--;
				}

				// Reassign starting values, restart by making startTime = now
				for (property in this._valuesStartRepeat) {

					if (typeof(this._valuesEnd[property]) === 'string') {
						this._valuesStartRepeat[property] = this._valuesStartRepeat[property] + parseFloat(this._valuesEnd[property], 10);
					}

					if (this._yoyo) {
						let tmp = this._valuesStartRepeat[property];

						this._valuesStartRepeat[property] = this._valuesEnd[property];
						this._valuesEnd[property] = tmp;
					}

					this._valuesStart[property] = this._valuesStartRepeat[property];

				}

				if (this._yoyo) {
					this._reversed = !this._reversed;
				}

				this._startTime = time + this._delayTime;
				return true;
			} else {
				this.emit(CONSTANTS.COMPLETE, new RodinEvent(null, {values: this}));
				for (let i = 0, numChainedTweens = this._chainedTweens.length; i < numChainedTweens; i++) {
					// Make the chained tweens start exactly at the time they should,
					// even if the `update()` method was called way past the duration of the tween
					this._chainedTweens[i].start(this._startTime + this._duration);
				}
				return false;
			}
		}
		return true;
	}
 }