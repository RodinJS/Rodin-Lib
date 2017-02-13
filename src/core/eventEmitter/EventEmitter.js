/**
 * Created by gor on 2/7/17.
 */

export class EventEmitter {
    constructor() {
        this.events = {};
    }

    /**
     * Add listener to Event.
     * @param {string[]|string} eventNames - event name(s)
     * @param {function} callback - callback function
     */
    addEventListener(eventNames, callback) {
        let events = this.events;
        if (!Array.isArray(evts)) {
            eventNames = [eventNames];
        }
        for (let i = 0; i < eventNames.length; i++) {
            let evt = eventNames[i];
            if (!this.events[evt]) {
                this.events[evt] = [];
            }
            this.events[evt].push(callback);
        }
    }

    /**
     * Add listener to Event
     * @param {string[]|string} eventNames - event name(s)
     * @param {function} callback - callback function
     */
    on(eventNames, callback) {
        this.addEventListener(eventNames, callback);
    }

    /**
     * Add listener to Event that called once
     * @param {string[]|string} eventNames - event name(s)
     * @param {function} callback - callback function
     */
    once(eventNames, callback) {
        const tmp = () => {
            callback(...arguments);
            this.removeEventListener(eventNames, tmp);
        };

        this.addEventListener(eventNames, tmp);
    }

    /**
     * Remove specific listener from Event
     * @param {string} eventName - event name
     * @param {function} callback - callback function
     *
     * @returns {boolean} true if callback removed. else if callback not assigned
     */
    removeEventListener(eventName, callback) {
        if (this.events[eventName] && this.events[eventName].indexOf(callback) !== -1) {
            this.events[eventName].splice(this.events[eventName].indexOf(callback), 1);
            return true;
        }

        return false;
    }

    /**
     * Emit Event with params
     * @param {String} eventName
     * @param {RodinEvent} rodinEvent - a custom Event object
     * @param {Array} args - arguments to be passed to the event callback
     */
    emit(eventName, rodinEvent, ...args) {
        rodinEvent.type = eventName;

        if (rodinEvent.propagation === false) {
            return;
        }

        if (this.events[eventName] && this.events[eventName].length > 0) {
            for (let f = 0; f < this.events[eventName].length; f++) {
                if (typeof this.events[eventName][f] === "function") {
                    this.events[eventName][f].apply((rodinEvent && rodinEvent.target), [rodinEvent].concat(args));
                }
            }
        }
    }

    emitAsync() {
        const tmpTimeout = setTimeout(() => {
            this.emit(...arguments);
            clearTimeout(tmpTimeout);
        }, 0);
    }
}
