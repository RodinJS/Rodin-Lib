/**
 * Custom Error class.
 * @param {string} message - custom Error message.
 */
class RodinError extends Error {
    constructor (message) {
        super(message);
        this.name = this.constructor.name;
        this.message = message;
        if (typeof Error.captureStackTrace === 'function') {
            Error.captureStackTrace(this, this.constructor);
        } else {
            this.stack = (new Error(message)).stack;
        }
    }
}
export class ErrorAbstractClassInstance extends RodinError {
    constructor () {
        super("Cant make instance of abstract class");
    }
}

export class ErrorSingletonClass extends RodinError {
    constructor () {
        super("Instantiation failed. Use .getInstance() method instead of new");
    }
}

export class ErrorInvalidUrl extends RodinError {
    constructor (filed) {
        super(`Invalid URL for ${filed}`);
    }
}

export class ErrorMAPClassInstance extends RodinError {
    constructor () {
        super(`Error making instance of MAP class, use static fields`);
    }
}

export class ErrorNoSceneProvided extends RodinError {
    constructor () {
        super(`Error no scene provided, use setScene method before raycastiong`);
    }
}

export class ErrorNoObjectProvided extends RodinError {
    constructor () {
        super(`Error no THREEJS object provided`);
    }
}

export class ErrorNoValueProvided extends RodinError {
    constructor (field) {
        super(`Error no ${field} provided`);
    }
}

export class ErrorMouseControllerAlreadyExists extends RodinError {
    constructor () {
        super(`Error Mouse controller already exists`);
    }
}

export class ErrorCardboardControllerAlreadyExists extends RodinError {
    constructor () {
        super(`Error Cardboard controller already exists`);
    }
}

export class ErrorViveControllerAlreadyExists extends RodinError {
    constructor (hand) {
        super(`Error Vive controller already exists for ${hand} hand`);
    }
}

export class ErrorOculusControllerAlreadyExists extends RodinError {
    constructor () {
        super(`Error Oculus controller already exists`)
    }
}

export class ErrorKeyboardControllerAlreadyExists extends RodinError {
    constructor () {
        super(`Error Cardboard controller already exists`)
    }
}

export class ErrorInvalidFileFormat extends RodinError {
    constructor () {
        super(`Invalid URL for ${filed}`)
    }
}

export class ErrorProtectedFieldChange extends RodinError {
    constructor (field = '') {
        super(`Protected field ${field} can not be changed`);
    }
}

export class ErrorProtectedMethodCall extends RodinError {
    constructor (method = '') {
        super(`Protected method ${method} can not be called`);
    }
}

export class ErrorInvalidEventType extends RodinError {
    constructor (eventName = '', action = '') {
        super(`Invalid event name ${eventName} for action ${action}`);
    }
}

export class ErrorParameterTypeDontMatch extends RodinError {
    constructor (paramName = '', type = '') {
        super(`Parameter ${paramName} must be in type ${type}`);
    }
}

export class ErrorInstantiationFailed extends RodinError {
    constructor (classname) {
        super(`Instantiation failed for class ${classname}. Use static functions instead of new`);
    }
}

export class ErrorUnsupportedModelType extends RodinError {
    constructor (typename) {
        super(`Unsupported model type ${typename}.`);
    }
}

export class ErrorInvalidArgument extends RodinError {
	constructor (typename) {
		super(`Invalid argument, expected ${typename}`);
	}
}
