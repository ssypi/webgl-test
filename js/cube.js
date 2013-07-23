var app = app || {};

app.Object = function (vertexArray, triangleArray, textureArray, imageSource) {
    "use strict";
    var pos = {
        x : 0,
        y : 0,
        z : 0
    };

    var scale = {
        x : 1.0,
        y : 1.0,
        z : 1.0
    };

    var rotation = {
        x : 0,
        y : 0,
        z : 0
    };

    var vertices = vertexArray;
    var triangles = triangleArray;
    var triangleCount = triangleArray.length;
    var textureMap = textureArray;
    var image = new Image();

    var ready = false;

    image.onload = function() {
        ready = true;
    };

    image.src = imageSource;

    function getTransforms() {
        //Create a Blank Identity Matrix
        var tMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

        //Scaling
        var temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        temp[0] *= scale.x;
        temp[5] *= scale.x;
        temp[10] *= scale.z;
        tMatrix = multiplyMatrix(tMatrix, temp);

        //Rotating X
        temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var x = rotation.x * (Math.PI / 180.0);
        temp[5] = Math.cos(x);
        temp[6] = Math.sin(x);
        temp[9] = -1 * Math.sin(x);
        temp[10] = Math.cos(x);
        tMatrix = multiplyMatrix(tMatrix, temp);
        //Rotating Y
        temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var y = rotation.y * (Math.PI / 180.0);
        temp[0] = Math.cos(y);
        temp[2] = -1 * Math.sin(y);
        temp[8] = Math.sin(y);
        temp[10] = Math.cos(y);
        tMatrix = multiplyMatrix(tMatrix, temp);

        //Rotating Z
        temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var z = rotation.z * (Math.PI / 180.0);
        temp[0] = Math.cos(z);
        temp[1] = Math.sin(z);
        temp[4] = -1 * Math.sin(z);
        temp[5] = Math.cos(z);
        tMatrix = multiplyMatrix(tMatrix, temp);
        //Moving
        temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        temp[12] = pos.x;
        temp[13] = pos.y;
        temp[14] = pos.z * -1;

        return multiplyMatrix(tMatrix, temp);
    }

    function multiplyMatrix(A, B) {
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
    }

    function mh(A, B) {
        var sum = 0;
        for (var i = 0; i < A.length; i++) {
            sum += A[i] * B[i];
        }
        return sum;
    }

    return {
        ready : ready
    };
};

app.cube = {
    rotation: 0,
    vertices: [ // X, Y, Z Coordinates

        //Front
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,

        //Back
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,

        //Right
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        //Left
        -1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0,

        //Top
        1.0, 1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0,

        //Bottom
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,
        1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0

    ],
    triangles: [ // Also in groups of threes to define the three points of each triangle
        //The numbers here are the index numbers in the vertex array

        //Front
        0, 1, 2,
        1, 2, 3,

        //Back
        4, 5, 6,
        5, 6, 7,

        //Right
        8, 9, 10,
        9, 10, 11,

        //Left
        12, 13, 14,
        13, 14, 15,

        //Top

        16, 17, 18,
        17, 18, 19,

        //Bottom

        20, 21, 22,
        21, 22, 23

    ],
    texture: [ //This array is in groups of two, the x and y coordinates (a.k.a U,V) in the texture
        //The numbers go from 0.0 to 1.0, One pair for each vertex

        //Front
        1.0, 1.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 0.0,


        //Back
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,

        //Right
        1.0, 1.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 0.0,

        //Left
        0.0, 1.0,
        0.0, 0.0,
        1.0, 1.0,
        1.0, 0.0,

        //Top
        1.0, 0.0,
        1.0, 1.0,
        0.0, 0.0,
        0.0, 1.0,

        //Bottom
        0.0, 0.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0
    ]
};