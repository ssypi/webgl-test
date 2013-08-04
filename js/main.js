/*globals model*/

var app = app || {};

(function (scope, undefined) {
    "use strict";

    var app = scope;

    var canvas,
        gl,
        aspect,
        program;


    var topBar = document.getElementById('fps');

    function initialize() {
        canvas = document.getElementById("mycanvas");
        aspect = canvas.width / canvas.height;
        if (!canvas.getContext("webgl") && !canvas.getContext("experimental-webgl")) {
            alert("Your browser doesn't support WebGL");
            return;
        }
        gl = (canvas.getContext("webgl")) ? canvas.getContext("webgl") : canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT);

        var vShader = compileShader("vertex", gl.VERTEX_SHADER);
        var fShader = compileShader("fragment", gl.FRAGMENT_SHADER);


        program = gl.createProgram();
        gl.attachShader(program, vShader);
        gl.attachShader(program, fShader);
        gl.linkProgram(program);

        // if linking failed
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.log(gl.getProgramInfoLog(program));
        }

        gl.useProgram(program);


//        program.vCount = gl.getAttribLocation(program, "jointsCount");
//        gl.enableVertexAttribArray(program.vCount);

        program.skinIndices = gl.getAttribLocation(program, "skinIndices");
        gl.enableVertexAttribArray(program.skinIndices);

        program.skinWeights = gl.getAttribLocation(program, "skinIndices");
        gl.enableVertexAttribArray(program.skinWeights);

        program.vertexPosition = gl.getAttribLocation(program, "vertexPosition");
        gl.enableVertexAttribArray(program.vertexPosition);


        program.vertexTexture = gl.getAttribLocation(program, "textureCoord");
        gl.enableVertexAttribArray(program.vertexTexture);


    }

    function compileShader(shaderId, shaderType) {
        var source = document.getElementById(shaderId).firstChild.nodeValue;
        var shader = gl.createShader(shaderType);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);

        // if compilation failed
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
        }

        return shader;
    }

    var done = false;

    function draw(model) {
//        if(model.ready && app.animaatio.ready && !done) {
//            console.log("applying");
//            app.animaatio.applyFrame(1, app.objekti);
//            model.compileBuffers(gl);
//            done = true;
//        }
//        console.log(model.image.readyState);
        if (model.ready) {

            gl.bindBuffer(gl.ARRAY_BUFFER, model.skinIndexBuffer);
            gl.vertexAttribPointer(program.skinIndices, 4, gl.FLOAT, false, 16, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.skinWeightBuffer);
            gl.vertexAttribPointer(program.skinWeights, 4, gl.FLOAT, false, 16, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.vertexBuffer);
            gl.vertexAttribPointer(program.vertexPosition, 3, gl.FLOAT, false, 12, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.textureBuffer);
            gl.vertexAttribPointer(program.vertexTexture, 2, gl.FLOAT, false, 8, 0);


            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.triangleBuffer);

            var perspectiveMatrix = makePerspective(45, aspect, 1, 1000.0);
            var transformMatrix = model.getTransforms();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, model.texture);

            gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

            var pMatrix = gl.getUniformLocation(program, "perspectiveMatrix");
            gl.uniformMatrix4fv(pMatrix, false, new Float32Array(perspectiveMatrix));

            var tMatrix = gl.getUniformLocation(program, "transformationMatrix");
            gl.uniformMatrix4fv(tMatrix, false, new Float32Array(transformMatrix));


            if (model.dirtyBones === undefined || model.dirtyBones === true) {
                console.log("bones dirty, updating");
                for (var index = 0; index < model.bones.length; index++) {
                    var bone = model.bones[index];

                    if (bone.parent !== undefined && bone.parent !== -1) {
                        var parent = model.bones[bone.parent];
                        bone.worldXForm = multiplyMatrix(parent.worldXForm, bone.transformationMatrix);
                    } else {
                        bone.worldXForm = bone.transformationMatrix;
                    }

                    bone.worldXForm = multiplyMatrix(bone.worldXForm, bone.inverseBind);

                    console.log(bone.worldXForm);
                    console.log(bone.name);
                    model.bones[index] = bone;
                }
                model.dirtyBones = false;
            }

            var boneMatrix = [];
            var bonesCount = model.bones.length;
            for (var i = 0; i < bonesCount; i++) {
                boneMatrix.push(gl.getUniformLocation(program, "boneMatrix[" + i + "]"));
                gl.uniformMatrix4fv(boneMatrix[i], true, new Float32Array(model.bones[i].worldXForm));
            }


//            boneMatrix.push(gl.getUniformLocation(program, "boneMatrix[0]"));
//            boneMatrix.push(gl.getUniformLocation(program, "boneMatrix[1]"));

//            var boneMatrix = gl.getUniformLocation(program, "boneMatrix");
//            console.log(model.bones[0].transformationMatrix);
//            model.ready = false;
//            gl.uniformMatrix4fv(boneMatrix, false, new Float32Array(model.bones[0].transformationMatrix));
//            gl.uniformMatrix4fv(boneMatrix[0], false, new Float32Array(model.bones[0].transformationMatrix));
//            gl.uniformMatrix4fv(boneMatrix[1], false, new Float32Array(model.bones[1].transformationMatrix));


            var triangleCount = model.triangles.length;

            gl.drawElements(gl.TRIANGLES, triangleCount, gl.UNSIGNED_SHORT, 0);

        }
    }

    function loadTexture(image) {
        //Create a new Texture and Assign it as the active one
        var TempTex = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, TempTex);

        //Flip Positive Y (Optional)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 1 / TRUE?

        //Load in The Image
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

        //Setup Scaling properties
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);

        //Unbind the texture and return it.
        gl.bindTexture(gl.TEXTURE_2D, null);
        return TempTex;
    }

    function makePerspective(fov, aspectRatio, closest, furthest) {
        var YLimit = closest * Math.tan(fov * Math.PI / 360);
        var A = -( furthest + closest ) / ( furthest - closest );
        var B = -2 * furthest * closest / ( furthest - closest );
        var C = (2 * closest) / ( (YLimit * aspectRatio) * 2 );
        var D = (2 * closest) / ( YLimit * 2 );
        return [
            C, 0, 0, 0,
            0, D, 0, 0,
            0, 0, A, -1,
            0, 0, B, 0
        ];
    }

    function ready() {
//        var textureImage = new Image();
//        textureImage.onload = function() {
//            console.log("texture loaded");
//            texture = loadTexture(textureImage);
//            setInterval(update, 33);
////            draw(cube, texture);
//        };
////        textureImage.src = "texture.png";

//        app.objekti = new app.Object(app.puudg.verticePosition, app.puudg.triangles, app.puudg.texturePosition, "minipudge_color.png");


        app.objekti = new app.Model();
        app.animaatio = new app.Animation();
        app.animaatio.load("js/objects/testi");

        app.objekti.load(gl, "js/objects/testi");
//        app.objekti.loadTexture("minipudge_color.png");

//        console.log(app.cube.vertices.length);
//        console.log(app.cube4.vertices.length);
//        console.log(app.cube.triangles.length);
//        console.log(app.cube4.triangles.length);
//        console.log(app.cube.texture.length);
//        console.log(app.cube4.texture.length);

        app.lattia = new app.Object(app.floor.vertices, app.floor.triangles, app.floor.texture, "texture.png");

        app.lattia.pos.x = 0;
        app.lattia.pos.y = -16;
        app.lattia.pos.z = 100;

        app.lattia.scale.x = 1;
        app.lattia.scale.y = 1;
        app.lattia.scale.z = 1;
//
//        app.objekti.pos.x = 0;
//        app.objekti.pos.y = 0;
//        app.objekti.pos.z = 5;
//
//        app.objekti.rotation.y = 0;
//
//        app.objekti.scale.x = 1;
//        app.objekti.scale.y = 1;
//        app.objekti.scale.z = 1;
//
//        app.objekti.pos.z = 100;
//        app.objekti.pos.y = -20;
//
//        //My Model Was a bit too big
//        app.objekti.scale.x = 0.5;
//        app.objekti.scale.y = 0.5;
//        app.objekti.scale.z = 0.5;
//
//        //And Backwards
//        app.objekti.rotation.y = 180;

        var building;

        setTimeout(update, 33);
//
//        LoadModel("minipudge", function (VerticeMap, Triangles, TextureMap) {
////            building = new app.Object(VerticeMap, Triangles, TextureMap, "minipudge_color.png");
//
////            building = {};
////            building.pos.z = 100;
////            building.pos.y = -20;
////
////            //My Model Was a bit too big
////            building.scale.x = 0.5;
////            building.scale.y = 0.5;
////            building.scale.z = 0.5;
////
////            //And Backwards
////            building.rotation.y = 180;
//
////            app.objekti = building;
//
//            setTimeout(update, 33);
//        });
    }

    var fps = 0;
    var lastUpdate = getTime();

    setInterval(function () {
//            topBar.innerHTML = fps;
        topBar.innerHTML = fps.toPrecision(2);
    }, 1000);

    function getTime() {
        var clock = new Date();
        return clock.getTime();
    }

    function update() {
        var clock = new Date();
        var start_time = clock.getTime();

        app.inputManager.update(app.objekti);
//        app.objekti.rotation.y += 0.2;
        gl.clear(16384 | 256);
//        draw(app.lattia);
        draw(app.objekti);

        var thisFrameFPS = 1000 / (getTime() - lastUpdate);
//        fps = thisFrameFPS;
        fps += (thisFrameFPS - fps) / 10;
        //console.log(fps);

        lastUpdate = getTime();

        clock = new Date();
        var end_time = clock.getTime();
        var spent_time = end_time - start_time;
        var next_frame = (1000 / 60) - spent_time;

        setTimeout(update, next_frame);
    }

    initialize();
    ready();
}(app));
