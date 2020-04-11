interface String {
    toTitleCase(keep?: boolean): string;
}

interface Array<T> {
    randomChoice(): T;
}

String.prototype.toTitleCase = function (keep?: boolean) {
    if (keep == true) {
        return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase();});
    }
    return this.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
};

Array.prototype.randomChoice = function () {
    return this[Math.floor(Math.random()*this.length)];
}