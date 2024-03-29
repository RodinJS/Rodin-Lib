import {Transport} from './Transport.js';
import * as CONST from '../constants/index.js';
import {messenger} from '../messenger/index.js';
import {RODIN_ID} from '../initializer/rodinId.js';
import {device} from '../device/index.js';


/**
 * A transport for sending message through iframes using postMessage function
 */
export class PostMessageTransport extends Transport {
    constructor() {
        super(CONST.POST_MESSAGE);
    }

    sendPacket(packet) {
        PostMessageTransport.setupPacket(packet);
        const receivers = PostMessageTransport.getReceivers(packet);
        packet.path.push(RODIN_ID);

        for (let i = 0; i < receivers.length; i++) {
            receivers[i].postMessage(packet, '*');
        }
    }

    get isPostMessageTransport() {
        return true;
    }

    /**
     * setup packet for sending
     * not available for user
     * @param packet
     */
    static setupPacket(packet) {
        if (!packet.path) {
            packet.path = [];
        }

        // todo: fix this later, no time now
        packet.isResponse = packet.body.isResponse;
        packet.destination = packet.body.destination;

        if (!packet.isResponse) {
            packet.isResponse = false;
        } else if (!packet.destination) {
            packet.destination = CONST.ALL;
        }

        packet.isRodin = true;
    }

    /**
     * Set packet receivers
     * not available for user
     * @param packet
     */
    static getReceivers(packet) {
        const receivers = [];

        switch (true) {
            case packet.destination === CONST.ALL:
                receivers.push(PostMessageTransport.parent);
                for (let i in PostMessageTransport.children) {
                    receivers.push(PostMessageTransport.children[i]);
                }
                break;

            case packet.destination === CONST.PARENT:
                receivers.push(PostMessageTransport.parent);
                break;

            case packet.destination === CONST.CHILDREN:
                for (let i in PostMessageTransport.children) {
                    receivers.push(PostMessageTransport.children[i]);
                }
                break;

            case Array.isArray(packet.destination):
                for (let i of packet.destination) {
                    if (PostMessageTransport.parentId === i)
                        receivers.push(PostMessageTransport.parent);
                    else if (PostMessageTransport.children[i])
                        receivers.push(PostMessageTransport.children[i]);
                    else {
                        //todo: restore the new Error when logic is fixed
                        console.warn(`unknown destination ${i}`);
                        //throw new Error(`unknown destination ${i}`);
                    }

                }
                break;

            default:
                throw new Error('unknown destination for package');
        }

        return receivers;
    }
}

export const postMessageTransport = new PostMessageTransport();

let parentAnswered = false;

window.addEventListener("message", (evt) => {
    if (!evt.data.isRodin) return;

    // sending a hello message to each new, unique, child
    if (evt.data.channel === 'connection' && evt.data.body.message === CONST.HELLO_FROM_CHILD && !PostMessageTransport.children[evt.data.body.childId]) {
        PostMessageTransport.children[evt.data.body.childId] = evt.source;
        messenger.post('connection', {
            parentId: RODIN_ID,
            message: CONST.HELLO_FROM_PARENT,
            destination: [evt.data.path[evt.data.path.length - 1]]
        }, postMessageTransport);
        return;
    }

    // registering parent after we got a hello, sending a message through a messenger to inform others
    if (evt.data.channel === 'connection' && evt.data.body.message === CONST.HELLO_FROM_PARENT && !parentAnswered) {
        PostMessageTransport.parentId = evt.data.body.parentId;
        parentAnswered = true;
        messenger.post(CONST.POST_MESSAGE_TRANSPORT_PARENT_ID, {parentId: PostMessageTransport.parentId});
        return;
    }

    messenger.receive(evt.data.channel, evt.data, postMessageTransport);
}, false);

/**
 * Notify parent when Rodin is ready
 */
messenger.post(CONST.REQUEST_RODIN_STARTED);
/**
 * ping parent every 100ms until it pings back
 */
messenger.once(CONST.RODIN_STARTED, () => {
    if (device.isIframe) {

        const pingParent = () => {
            messenger.post('connection', {
                childId: RODIN_ID,
                message: CONST.HELLO_FROM_CHILD,
                destination: CONST.PARENT
            }, postMessageTransport);
        };

        let timeout = null;
        const timoutCallback = () => {
            if (!parentAnswered) {
                clearTimeout(timeout);
                pingParent();
                setTimeout(timoutCallback, 100);
            }
        };

        timeout = setTimeout(timoutCallback, 100);
        pingParent();
    }
});

PostMessageTransport.parent = window.parent;
PostMessageTransport.parentId = '';
PostMessageTransport.children = {};

/**
 * Notify parent when all sculpts are loaded
 */
messenger.on(CONST.ALL_SCULPTS_READY, (data, transport) => {
    if (transport !== postMessageTransport)
        messenger.post(CONST.ALL_SCULPTS_READY, {
            destination: CONST.PARENT
        }, postMessageTransport);
});

/**
 * Notify parent when enter or exit VR
 */
messenger.on(CONST.ENTER_VR_SUCCESS, (data, transport) => {
    if(transport !== postMessageTransport)
        messenger.post(CONST.ENTER_VR_SUCCESS, {destination: CONST.PARENT}, postMessageTransport);
});

messenger.on(CONST.EXIT_VR_SUCCESS, (data, transport) => {
    if(transport !== postMessageTransport)
        messenger.post(CONST.EXIT_VR_SUCCESS, {destination: CONST.PARENT}, postMessageTransport);
});