/**
 * Transport class
 * Use it for sending messages with messenger.
 * Pass instance as parameter
 */
export class Transport {
    constructor(name) {
        this.name = name;
    }

    sendPacket() {
        throw new Error('sendPacket is not overloaded');
    }

    get isTransport() {
        return true;
    }
}
