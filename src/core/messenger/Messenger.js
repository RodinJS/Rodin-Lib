/**
 * Created by gor on 2/7/17.
 */

/**
 * Messenger for collaborating classes
 */
export class Messenger {
    constructor() {
        this.channels = {};
    }

    /**
     * Post message to channel
     * @param channel {string} channel to post message
     * @param body {*} body to post
     */
    post(channel, body) {
        if (!this.channels[channel]) {
            return;
        }

        this.channels[channel].map(cb => cb(body));
    }

    /**
     * Receive messages from channel.
     * @param channel {string} channel
     * @param callback {Function} calls this function each time when someone posts message to this channel
     */
    on(channel, callback) {
        if (!this.channels[channel]) {
            this.channels[channel] = [];
        }

        this.channels[channel].push(callback);
    }

    /**
     * Receive messages from channel.
     * @param channel {string} channel
     * @param callback {Function} calls this function only once when someone posts message to this channel
     */
    once(channel, callback) {
        const tmp = () => {
            callback();
            this.channels[channel].splice(this.channels[channel].indexOf(callback), 1);
        };

        this.on(channel, callback);
    }
}

const messenger = new Messenger();

export {messenger};
