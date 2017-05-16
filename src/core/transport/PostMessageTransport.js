import {Transport} from './Transport';
import * as CONST from '../constants';
import {messenger} from '../messenger';
import {RODIN_ID} from '../initializer';

/**
 * TODO: @serg fix comments
 * TODO: @serg gidem vor comment chka chases sra inch@ fixem ? :D
 */
export class PostMessageTransport extends Transport {
    constructor() {
        super(CONST.POST_MESSAGE);
    }

    sendPacket(packet) {
        if(!packet.path) {
            packet.path = [];
        }

        packet.path.add(RODIN_ID);

        for(let child in PostMessateTransport.children) {
            child.postMessage(packet, '*');
        }
    }

    get isPostMessageTransport() {
        return true;
    }

    static parent = window.parent;
    static hasParent = window.parent && window.parent !== window;
    static children = {}
}

export const postMessageTransport = new PostMessageTransport();

window.addEventListener("message", (evt) => {
    if(evt.data && evt.data.body === CONST.NEW_CHILD) {
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
    if(PostMessageTransport.hasParent) {
        postMessageTransport.sendPacket({
            childId: RODIN_ID,
            body: CONST.NEW_CHILD
        });
    }
});
