import {localTransport} from '../transport/LocalTransport';

/**
 * Messenger for collaborating classes
 */
export class Messenger {
    constructor() {
        this.channels = {};
    }

    /**
     * TODO: @serg fix comments
     * Post a message to a channel
     * @param channel {string} channel to post a message
     * @param body {*} body of the message to post
     * @param transport {Transport} transport with which send data
     */
    post(channel, body, transport = localTransport) {
        if (!this.channels[channel]) {
            return;
        }

        transport.sendData({channel, body});
    }

    /**
     * TODO: @serg fix comments
     * Post a message to a channel async
     * @param channel
     * @param body
     */
    postAsync(channel, body) {
        if (!this.channels[channel]) {
            return;
        }

        setTimeout(() => {
            this.post(channel, body);
        }, 0);
    }


    /**
     * TODO: @serg fix comments
     * Receive function
     * @param channel
     * @param body
     * @param transport
     */
    receive(channel, body, transport) {
        for (let i = 0; i < this.channels[channel].length; i++) {
            this.channels[channel][i](body, transport);
        }
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
            this.channels[channel].splice(this.channels[channel].indexOf(tmp), 1);
        };

        this.on(channel, tmp);
    }
}

const messenger = new Messenger();

export {messenger};
