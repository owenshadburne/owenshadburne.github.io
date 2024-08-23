export default class Enumerate {
    constructor(callback, options) {
        this.callback = callback;
        this.options = options
        this.requestID = null;
        this.enumerate();
    }

    enumerate() {
        this.requestID = null;
        this.options = this.callback(this.options);
        if(this.options && this.options?.exit) { 
            this.stop();
        }
        else {
            this.start();
        }
    }

    start() {
        if(!this.requestID) {
            this.requestID = window.requestAnimationFrame(() => {
                this.enumerate(this.options);
            });
        }
    }
    stop() {
        if(this.requestID) {
            window.cancelAnimationFrame(this.requestID);
            this.requestID = null;
        }
    }
}