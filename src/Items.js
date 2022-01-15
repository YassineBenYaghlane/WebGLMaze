class Items {
    constructor(keys=[]){
        this.keys = keys;
    };

    keysCount() {
        return this.keys.length;
    };

    addKey(k) {
        this.keys.push(k);
    };

    displayKeys(tag) {
        var txt = `Keys: ${this.keys.length}/3`
        tag.innerHTML = txt;
    };

    removeKeys() {
        this.keys = [];
    }
}