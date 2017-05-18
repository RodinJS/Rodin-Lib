import {Transport} from './Transport';
import * as CONST from '../constants';
import {messenger} from '../messenger';
import {RODIN_ID} from '../initializer';
import {device} from '../device';

/**
 * A transport for sending message through iframes using postMessage function
 */
export class PostMessageTransport extends Transport {
    constructor() {
        super(CONST.POST_MESSAGE);
    }

    sendPacket(packet) {
        if (!packet.path) {
            packet.path = [];
        }

        packet.path.push(RODIN_ID);

        if (device.isIframe)
            PostMessageTransport.parent.postMessage(packet, '*');

        for (let childId in PostMessageTransport.children) {
            PostMessageTransport.children[childId].postMessage(packet, '*');
        }
    }

    get isPostMessageTransport() {
        return true;
    }

    static parent = window.parent;
    static children = {}
}

export const postMessageTransport = new PostMessageTransport();

window.addEventListener("message", (evt) => {
    if (evt.data && evt.data.body === CONST.NEW_CHILD) {
        PostMessageTransport.children[evt.data.childId] = evt.source;
        return;
    }

    messenger.receive(evt.data.channel, evt.data.body, postMessageTransport);
}, false);

/**
 * Notify parent when Rodin is ready
 */
messenger.post(CONST.REQUEST_RODIN_STARTED);

messenger.once(CONST.RODIN_STARTED, () => {
    if (device.isIframe) {
        postMessageTransport.sendPacket({
            childId: RODIN_ID,
            body: CONST.NEW_CHILD
        });
    }
});
