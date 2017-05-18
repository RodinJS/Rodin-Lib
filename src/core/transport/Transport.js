import {ErrorAbstractClassInstance} from '../error';

/**
 * Use it for sending messages with messenger
 */
export class Transport {
    constructor(name) {
        if(this.constructor === Transport) {
            throw new ErrorAbstractClassInstance('Transport');
        }

        this.name = name;
    }

    sendPacket() {
        throw new Error('sendPacket is not overloaded');
    }

    get isTransport() {
        return true;
    }
}
