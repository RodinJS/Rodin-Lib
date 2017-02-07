/**
 * Created by gor on 2/7/17.
 */

let oldPush = Array.prototype.push;

export class Set extends Array {
    constructor() {
        super(...arguments);

        /**
         * push element to set
         * @param item
         * @returns {Error}
         */
        this.push = function (item) {
            if (this.indexOf(item) === -1) {
                if (this.validate) {
                    item = this.validate(item);
                }
                oldPush.call(this, item);
            } else {
                return new Error('Item already exists');
            }
        };

        /**
         * remove element from set
         * @param item
         * @returns {boolean}
         */
        this.remove = function (item) {
            let index = this.indexOf(item);
            if (index !== -1) {
                this.splice(index, 1);
                return true;
            }

            return false;
        }
    }
}
