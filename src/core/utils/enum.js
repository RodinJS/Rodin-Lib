export class EnumGenerator {
    constructor() {
        this.value = 1;
    }

    next() {
        this.value <<= 1;
        return this.value;
    }
}