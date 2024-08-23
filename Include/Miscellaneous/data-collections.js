// credit: https://www.geeksforgeeks.org/implementation-queue-javascript/
export class Queue {
    constructor() {
        this.items = {}
        this.frontIndex = 0
        this.backIndex = 0
    }
    
    enqueue(item) {
        this.items[this.backIndex] = item
        this.backIndex++
        return item + ' inserted'
    }
    dequeue() {
        const item = this.items[this.frontIndex]
        delete this.items[this.frontIndex]
        this.frontIndex++
        return item
    }

    peek() {
        return this.items[this.frontIndex]
    }

    get printQueue() {
        return this.items;
    }
}

export class Stack {
    constructor() {
        this.items = [];
        this.onPopListeners = [];
    }

    push(item) {
        this.items.push(item);
    }
    pop(item) {
        this.items.pop(item);
        this.onPopNotify();
    }

    peek() {
        return this.items[this.items.length - 1];
    }
    next() {
        if(this.size <= 1) { return null; }
        return this.items[this.items.length - 2];
    }
    get size() {
        return this.items.length;
    }

    isEmpty() {
        return this.items.length == 0;
    }

    onPopSub(callback) {
        this.onPopListeners.push(callback);
    }
    onPopUnsub(callback) {
        const index = this.onPopListeners.indexOf(callback);
        this.onPopListeners.splice(index, 1);
    }
    onPopNotify() {
        for(const callback of this.onPopListeners) {
            callback();
        }
    }
}