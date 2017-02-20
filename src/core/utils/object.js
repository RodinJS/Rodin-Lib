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

Object.getProperty = function (obj, prop) {
    let props = prop.split('.');
    let tmp = obj;

    for (let i = 0; i < props.length; i++) {
        if (!tmp.hasOwnProperty(props[i])) {
            return;
        }

        tmp = tmp[props[i]];
    }

    return tmp;
};

Object.setProperty = function (obj, prop, val) {
    let props = prop.split('.');
    let tmp = obj;

    for (let i = 0; i < props.length - 1; i++) {
        if (!tmp.hasOwnProperty(props[i])) {
            tmp[props[i]] = {};
        }

        tmp = tmp[props[i]];
    }

    tmp[props[props.length - 1]] = val;
};

Object.clone = function (obj) {
    if (obj === null || typeof(obj) !== 'object' || 'isActiveClone' in obj)
        return obj;

    let temp = null;
    if (obj instanceof Date)
        temp = new obj.constructor();
    else
        temp = obj.constructor();

    for (let key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            obj['isActiveClone'] = null;
            temp[key] = Object.clone(obj[key]);
            delete obj['isActiveClone'];
        }
    }

    return temp;
};


/**
 * Joins nested objects into single level objects
 * @param {Object} obj
 * @param {Array} skip
 * @return {Object} single level obj
 */
Object.joinParams = function(obj, skip = []) {
    let res = {};
    for (let i in obj) {
        if (obj[i].constructor === Object){
            let cur = Object.joinParams(obj[i], skip);
            for (let j in cur) {
                if (!skip.includes(j)) {
                    res[i + '.' + j] = cur[j];
                }
                else {
                    if (!res[i])
                        res[i] = {};
                    res[i][j] = cur[j];
                }
            }
        }
        else
            res[i] = obj[i];
    }
    return res;
};
