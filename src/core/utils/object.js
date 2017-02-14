import {UID} from './string';

export const getId = (object) => {
    if(!object["__uid__"]) {
        object["__uid__"] = UID();
    }

    return object["__uid__"];
};