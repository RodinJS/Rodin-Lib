import {ClassType} from './argumentScheme/ClassType';
import {NumberType} from './argumentScheme/NumberType';
import {StringType} from './argumentScheme/StringType';
import {ArrayType} from './argumentScheme/ArrayType';
import {AnyType} from './argumentScheme/AnyType';
import {BoolType} from './argumentScheme/BoolType';
import {FunctionType} from './argumentScheme/FunctionType';

import {
    ErrorInstantiationFailed,
    ErrorProtectedMethodCall,
    ErrorArgumentLoop,
    ErrorNoDefaultValue,
    ErrorArgumentType,
    ErrorUndefinedReference
} from '../error';

function enforce() {
}

export class AScheme {
    constructor() {
        throw new ErrorInstantiationFailed();
    }

    static string(...args) {
        return new StringType(...args);
    }

    static number(...args) {
        return new NumberType(...args);
    }

    static class(...args) {
        return new ClassType(...args);
    }

    static array(...args) {
        return new ArrayType(...args);
    }

    static bool(...args) {
        return new BoolType(...args);
    }

	static function(...args) {
		return new FunctionType(...args);
	}

    static any(...args) {
        return new AnyType(...args);
    }


    /**
     * Gets the default value, if it is a reference, looks for it
     * in previously set values, if its not there, throws an error
     * @param e
     * @param res
     * @param defaultValue
     * @returns {*}
     */
    static handleDefault(e, res, defaultValue) {
        if (e !== enforce) {
            throw new ErrorProtectedMethodCall('handleDefault');
        }

        if (AScheme.isReference(e, defaultValue)) {

            defaultValue = defaultValue.substr(1);
            if (res[defaultValue])
                return res[defaultValue];

            throw new ErrorUndefinedReference(defaultValue);
        }
        else {
            return defaultValue;
        }
    }

    /**
     * Checks if value is a reference,
     * if it is a string and starts with $
     * it is considered a reference
     * @param e
     * @param value
     * @returns {boolean}
     */
    static isReference(e, value) {
        if (e !== enforce) {
            throw new ErrorProtectedMethodCall('isReference');
        }
        return (value.constructor === String && value.length > 1 && value.charAt(0) == '$');
    }

    /**
     * Gets the reference name from reference string
     * strips $ from the beginning of the string
     * @param e
     * @param ref
     * @returns {string}
     */
    static getReference(e, ref) {
        return ref.substr(1);
    }

    /**
     * Loops through references recursively to find and assign values
     * if detects loops, or finds no values assigned to variables
     * throws errors
     * @param {function} e
     * @param {Object} res
     * @param {Object }scheme
     * @param {String} reference
     * @param {Array} been
     * @returns {*}
     */
    static handleReferenceTree(e, res, scheme, reference, been = []) {
        if (e !== enforce) {
            throw new ErrorProtectedMethodCall('handleReferenceTree');
        }
        if (been.indexOf(reference) !== -1) {
            throw new ErrorArgumentLoop();
        }
        been.push(reference);
        if (scheme[reference].hasDefault && AScheme.isReference(e, scheme[reference].default())) {
            res[reference] = AScheme.handleReferenceTree(e, res, scheme, AScheme.getReference(e, scheme[reference].default()), been);
        }
        if (res.hasOwnProperty(reference))
            return res[reference];
        throw new ErrorNoDefaultValue(reference);
    }

    /**
     * Validates function arguments with a given scheme
     * @param {Array|Object} args - arguments from a function ...args
     * @param {Object} scheme - scheme object to define default values and references
     * @returns {{}} - an object with keys from scheme and values from args
     */
    static validate(args, scheme) {
        const res = {};


        // we need this because if user passes ...args to validate
        // it will never be an object, always an array, this is 80% check
        // if the first argument is an object, not a class, then we assume
        // it to be an object constructor
        // todo: not sure about this, maybe we should try to validate both ways
        // todo: and get the one that did better?
        if (args.constructor === Array && args.length === 1 && typeof args[0] === 'object' && args[0].constructor === Object)
            args = args[0];

        if (args.constructor == Array) {

            let argIndex = 0;
            for (let i in scheme) {
                if (!scheme.hasOwnProperty(i))
                    continue;
                let curArg = args[argIndex];
                // if argument is undefined or doesn't pass validation
                // try to get the default value for it.
                if (curArg === undefined || !scheme[i].validate(curArg)) {
                    if (scheme[i].hasDefault) {
                        res[i] = AScheme.handleDefault(enforce, res, scheme[i].default());
                    }
                    else {
                        // if it does not have a default value, throw an error
                        throw new ErrorNoDefaultValue(i);
                    }
                }
                else {
                    // if argument passed validation and is not undefined
                    // assign it to res, and go to the next one
                    res[i] = curArg;
                    argIndex++;
                }
            }

        }
        else if (typeof args === 'object') {
            // in this case we don't have a strict order for
            // arguments, so we will need to instantiate all
            // arguments that are not references, then try
            // to instantiate references

            /**
             * an array to store references
             * @type {Array}
             */
            const references = [];

            for (let i in scheme) {
                if (!scheme.hasOwnProperty(i))
                    continue;

                let curArg = args[i];
                // if the something was not passed in the object
                // try to instantiate it with a default value
                if (curArg === undefined) {
                    // if it is a reference add it to an array
                    if (AScheme.isReference(enforce, scheme[i].default())) {
                        //in this case we handle references later
                        references.push(i);
                        continue;
                    }

                    if (scheme[i].hasDefault) {
                        res[i] = AScheme.handleDefault(enforce, res, scheme[i].default());
                    }
                    else {
                        // if we don't have a default value, throw an error
                        throw new ErrorNoDefaultValue(i);
                    }
                }
                else {
                    // validate argument and add to result,
                    // if validation fails throw an error
                    if (!scheme[i].validate(curArg)) {
                        throw new ErrorArgumentType(curArg, scheme[i]);
                    }
                    res[i] = curArg;
                }
            }
            // loop through the references we saved earlier
            // and try to instantiate them recursively
            for (let i = 0; i < references.length; i++) {
                if (res.hasOwnProperty(references[i]))
                    continue;
                res[references[i]] = AScheme.handleReferenceTree(enforce, res, scheme, references[i], []);
            }
        }

        return res;

    }
}