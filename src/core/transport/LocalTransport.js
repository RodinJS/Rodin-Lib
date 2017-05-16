import {Transport} from './Transport';
import * as CONST from '../constants';
import {messenger} from '../messenger';

/**
 * TODO: @serg fix comments
 * Local Transport
 * Use it to send data inside Rodin
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
