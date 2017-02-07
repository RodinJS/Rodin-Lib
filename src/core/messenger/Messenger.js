/**
 * Created by gor on 2/7/17.
 */

export class Messenger {
    constructor() {
        this.channels = {};
    }

    post(name, body) {
        if (this.channels[name]) {
            return;
        }

        this.channels[name].map(cb => cb(body));
    }

    on(name, callback) {
        if (!this.channels[name]) {
            this.channels[name] = [];
        }

        this.channels[name].push(callback);
    }
}

const instance = new Messenger();

export { instance };
