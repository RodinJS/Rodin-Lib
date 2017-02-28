import {UID} from './string';

/**
 * If object have not unique id, assign id to it
 * @param object {Object}
 * @returns {string} object's unique id
 */
export const getId = (object) => {
    if(!object["__uid__"]) {
        object["__uid__"] = UID();
    }

    return object["__uid__"];
};