import {Transport} from './Transport';
import * as CONST from '../constants';

export class LocalTransport extends Transport {
    constructor() {
        super(CONST.LOCAL);
    }
}

export const localTransport = new LocalTransport();