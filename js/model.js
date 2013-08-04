/*globals tools*/

var app = app || {};

(function (scope, undefined) {
    "use strict";

    app.Model = function () {
        this.ready = false;

        this.pos = {
            x: 0,
            y: 0,
            z: 0
        };

        this.scale = {
            x: 1.0,
            y: 1.0,
            z: 1.0
        };

        this.rotation = {
            x: 0,
            y: 0,
            z: 0
        };

        this.vertices = [];
        this.triangles = [];
        this.textureMap = [];

        this.vCount = [];

        this.vertexBuffer = null;
        this.triangleBuffer = null;
        this.textureBuffer = null;

        this.image = null;
        this.imageSource = null;
        this.texture = null;
    };

    app.Model.prototype.load = function (gl, url, callback) {
        var self = this;

        var jsonXhr = new XMLHttpRequest();
        jsonXhr.open('GET', url + ".json", true);
        jsonXhr.onload = function () {
            // TODO: error handling
            var model = JSON.parse(this.responseText);
            self.parseModel(model);
            self.loadTexture(self.imageSource, gl);
//            self.compileBuffers(gl);
//            self.ready = true;

//            self.compileMaterials(gl, self.meshes);
//            modelComplete = true;

            if (callback) {
                callback(self);
            }
        };
        jsonXhr.send(null);
//
//        if (!skinnedModelShader) {
//            skinnedModelShader = glUtil.createShaderProgram(gl, skinnedModelVS, skinnedModelFS,
//                ["position", "texture", "normal", "weights", "bones"],
//                ["viewMat", "modelMat", "projectionMat", "diffuse",
//                    "lightPos", "boneMat"]
//            );
//        }
    };

    app.Model.prototype.prepareTexture = function (gl) {
        var TempTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, TempTex);

        //Flip Positive Y (Optional)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 1 / TRUE?

        //Load in The Image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.image);

        //Setup Scaling properties
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        //Unbind the texture and return it.
        gl.bindTexture(gl.TEXTURE_2D, null);
        this.texture = TempTex;
    };

    app.Model.prototype.compileBuffers = function (gl) {
        var self = this;

        var buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.skinIndices), gl.STATIC_DRAW);
        self.skinIndexBuffer = buffer;

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.skinWeights), gl.STATIC_DRAW);
        self.skinWeightBuffer = buffer;

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.vertices), gl.STATIC_DRAW);
        self.vertexBuffer = buffer;

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(self.triangles), gl.STATIC_DRAW);
        self.triangleBuffer = buffer;

        buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(self.textureMap), gl.STATIC_DRAW);
        self.textureBuffer = buffer;

    };

    app.Model.prototype.parseModel = function (model) {
        this.vertices = model.verticePosition;
        this.textureMap = model.texturePosition;
        this.triangles = model.triangles;

        this.bones = model.bones;
        this.vCount = model.weights.vCount;
        this.v = model.weights.v;
        this.weightArray = model.weightArray;
        this.imageSource = model.imageSource;

        this.boneIds = this.getBoneIds();

        this.setWeights();
    };

    app.Model.prototype.getBoneIds = function() {
        var bones = this.bones;
        var boneIds = [];
        for (var i = 0; i < bones.length; i++) {
            boneIds[i] = bones[i].name;
        }
        return boneIds;
    };
//
//    vCount
//        4 2 1 2
//    v
//        1 2 2 1 3 4 4 2
//        1 1 2 1
//        1 2
//        1 1 2 2


    app.Model.prototype.setWeights = function () {
        var verticeCount = this.vCount.length;
        var vCount = this.vCount;
        var v = this.v;
        var weights = this.weightArray;

        this.skinIndices = []; // indices of bones that are affected by the weights
        this.skinWeights = []; // weights for the bones

        var vOffset = 0;

        for (var i = 0; i < verticeCount; i++) {
            var influences = vCount[i];
//            var vOffset = 0;
            var offset = i * 4;
            for (var j = 0; j < influences; j++) {
                var jointIndex = v[vOffset];
                var weightIndex = v[vOffset+1];
                this.skinIndices[offset] = jointIndex;
                this.skinWeights[offset] = weights[weightIndex];
                vOffset += 1;
                offset += 1;
            }
            while(influences < 4) {
                this.skinIndices[offset] = 0;
                this.skinWeights[offset] = 0;
                influences += 1;
                offset += 1;
            }
        }
        console.log("vertices: " + this.vertices.length / 3);
        console.log("influences j: " + this.skinIndices.length / 4);
        console.log("influences w: " + this.skinWeights.length / 4);

    };

    app.Model.prototype.loadTexture = function (imageSource, gl) {
        var self = this;
        self.image = new Image();
        self.image.readyState = false;
        self.image.onload = function () {
            console.log("image readystate true");
            self.image.readyState = true;
            self.prepareTexture(gl);
            self.compileBuffers(gl);
            self.ready = true;
        };
        self.image.src = imageSource;
    };

    app.Model.prototype.getTransforms = function () {
        //Create a Blank Identity Matrix
        var tMatrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

        //Scaling
        var temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        temp[0] *= this.scale.x;
        temp[5] *= this.scale.x;
        temp[10] *= this.scale.z;
        tMatrix = multiplyMatrix(tMatrix, temp);

        //Rotating X
        temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var x = this.rotation.x * (Math.PI / 180.0);
        temp[5] = Math.cos(x);
        temp[6] = Math.sin(x);
        temp[9] = -1 * Math.sin(x);
        temp[10] = Math.cos(x);
        tMatrix = multiplyMatrix(tMatrix, temp);
        //Rotating Y
        temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var y = this.rotation.y * (Math.PI / 180.0);
        temp[0] = Math.cos(y);
        temp[2] = -1 * Math.sin(y);
        temp[8] = Math.sin(y);
        temp[10] = Math.cos(y);
        tMatrix = multiplyMatrix(tMatrix, temp);

        //Rotating Z
        temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        var z = this.rotation.z * (Math.PI / 180.0);
        temp[0] = Math.cos(z);
        temp[1] = Math.sin(z);
        temp[4] = -1 * Math.sin(z);
        temp[5] = Math.cos(z);
        tMatrix = multiplyMatrix(tMatrix, temp);
        //Moving
        temp = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
        temp[12] = this.pos.x;
        temp[13] = this.pos.y;
        temp[14] = this.pos.z * -1;

        return multiplyMatrix(tMatrix, temp);
    };
})(app);

