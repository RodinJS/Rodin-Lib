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
     * Post a message to a channel
     * @param channel {string} channel to post a message
     * @param body {*} body of the message to post
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
     * @param callback {Function} calls this function each time when someone posts a message to this channel
     */
    on(channel, callback) {
        if (!this.channels[channel]) {
            this.channels[channel] = [];
        }

        this.channels[channel].push(callback);
    }

    /**
     * Receive messages from channel and execute the callback function only once. After execution, this listener will remove itself
     * @param channel {string} channel
     * @param callback {Function} calls this function only once when someone posts a message to this channel
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
