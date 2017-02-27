export class EnumGenerator {
    constructor() {
        this.value = 1;
    }

    next() {
        // todo: fix this
        this.value += 1;
        // this.value <<= 1;
        return this.value;
    }
}