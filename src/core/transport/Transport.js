/**
 * Transport class
 * Use it for sending messages with messenger.
 * Pass instance as parameter
 */
export class Transport {
    constructor(name) {
        this.name = name;
    }

    sendData() {
        throw new Error('Send method is not overloaded');
    }
}