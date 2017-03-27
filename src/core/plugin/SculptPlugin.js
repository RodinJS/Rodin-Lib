import {Plugin} from './Plugin';

/**
 * Base class for sculpt plugins
 * Extend this for creating sculpt plugins
 */
export class SculptPlugin extends Plugin {
    constructor() {
        super();
    }

    /**
     * Applies plugin to a sculpt
     * @param sculpt
     */
    applyTo(sculpt) {
        this.sculpt = sculpt;
    }
}
