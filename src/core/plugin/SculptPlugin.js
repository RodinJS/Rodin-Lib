import {Plugin} from './Plugin';

export class SculptPlugin extends Plugin {
    constructor() {
        super();
    }

    applyTo(sculpt) {
        this.sculpt = sculpt;
    }
}
