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

/**
 *
 * @param obj
 * @param prop
 * @returns {*}
 */
export const getProperty = (obj, prop) => {
    let props = prop.split('.');
    let tmp = obj;

    for (let i = 0; i < props.length; i++) {
        if (tmp[props[i]] === undefined) {
            return;
        }

        tmp = tmp[props[i]];
    }

    return tmp;
};

/**
 *
 * @param obj
 * @param prop
 * @param val
 */
export const setProperty =  (obj, prop, val) => {
    let props = prop.split('.');
    let tmp = obj;

    for (let i = 0; i < props.length - 1; i++) {
        if (tmp[props[i]] === undefined) {
            tmp[props[i]] = {};
        }

        tmp = tmp[props[i]];
    }

    tmp[props[props.length - 1]] = val;
};

export const clone = obj => {
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
            temp[key] = clone(obj[key]);
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
export const joinParams = (obj, skip = []) => {
    let res = {};
    for (let i in obj) {
        if (obj[i].constructor === Object){
            let cur = joinParams(obj[i], skip);
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

const isObj = function (x) {
    const type = typeof x;
    return x !== null && (type === 'object' /*|| type === 'function'*/);
};

function toObject(val) {
    if (val === null || val === undefined) {
        throw new TypeError('Cannot convert undefined or null to object');
    }

    return Object(val);
}

function assignKey(to, from, key) {
    let val = from[key];

    if (val === undefined || val === null) {
        return;
    }

    if (Object.prototype.hasOwnProperty.call(to, key)) {
        if (to[key] === undefined || to[key] === null) {
            throw new TypeError('Cannot convert undefined or null to object (' + key + ')');
        }
    }

    if (!Object.prototype.hasOwnProperty.call(to, key) || !isObj(val)) {
        to[key] = val;
    } else {
        to[key] = assign(Object(to[key]), from[key]);
    }
}

const assign = (to, from) => {
    if (to === from) {
        return to;
    }

    from = Object(from);

    for (let key in from) {
        if (Object.prototype.hasOwnProperty.call(from, key)) {
            assignKey(to, from, key);
        }
    }

    if (Object.getOwnPropertySymbols) {
        let symbols = Object.getOwnPropertySymbols(from);

        for (let i = 0; i < symbols.length; i++) {
            if (Object.prototype.propIsEnumerable.call(from, symbols[i])) {
                assignKey(to, from, symbols[i]);
            }
        }
    }

    return to;
};

export const deepAssign = target => {
    target = toObject(target);

    for (let s = 1; s < arguments.length; s++) {
        assign(target, arguments[s]);
    }
    return target;
};
