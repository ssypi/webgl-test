var Kalamies = function () {
    "use strict";
    this.k = 1;

    var a = 0;

    return {
        a : a
    };
};

Kalamies.prototype = {
    constructor : Kalamies,
    kala : function () {
        alert("hoi");
    }
};

var kala = new Kalamies();

kala.kala();
alert(kala.k);
