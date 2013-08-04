var multiplyMatrix = function (A, B) {
    "use strict";
    var A1 = [A[0], A[1], A[2], A[3]];
    var A2 = [A[4], A[5], A[6], A[7]];
    var A3 = [A[8], A[9], A[10], A[11]];
    var A4 = [A[12], A[13], A[14], A[15]];

    var B1 = [B[0], B[4], B[8], B[12]];
    var B2 = [B[1], B[5], B[9], B[13]];
    var B3 = [B[2], B[6], B[10], B[14]];
    var B4 = [B[3], B[7], B[11], B[15]];

    return [
        mh(A1, B1), mh(A1, B2), mh(A1, B3), mh(A1, B4),
        mh(A2, B1), mh(A2, B2), mh(A2, B3), mh(A2, B4),
        mh(A3, B1), mh(A3, B2), mh(A3, B3), mh(A3, B4),
        mh(A4, B1), mh(A4, B2), mh(A4, B3), mh(A4, B4)];
};

var mh = function (A, B) {
    var sum = 0;
    for (var i = 0; i < A.length; i++) {
        sum += A[i] * B[i];
    }
    return sum;
};