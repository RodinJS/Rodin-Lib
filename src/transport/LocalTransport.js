import {Transport} from './Transport.js';
import * as CONST from '../constants/index.js';
import {messenger} from '../messenger/Messenger.js';

/**
 * A transport for sending messages inside a single session
 */
export class LocalTransport extends Transport {
    constructor() {
        super(CONST.LOCAL);
    }

    sendPacket(packet) {
        messenger.receive(packet.channel, packet.body, this);
    }

    get isLocalTransport() {
        return true;
    }
}

export const localTransport = new LocalTransport();
