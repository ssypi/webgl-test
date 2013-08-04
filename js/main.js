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

    function prepareModel(model) {
        model.image = loadTexture(model.image);

        //Convert Arrays to buffers
        var buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.vertices), gl.STATIC_DRAW);
        model.vertices = buffer;

        buffer = gl.createBuffer();

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.triangles), gl.STATIC_DRAW);
        model.triangles = buffer;

        buffer = gl.createBuffer();

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.textureMap), gl.STATIC_DRAW);
        model.textureMap = buffer;
        model.ready = true;
        console.log("model ready: " + model.ready);
    }

    function draw(model) {
        if (model.image.readyState && !model.ready) {
            prepareModel(model);
        }
        if (model.ready) {
            gl.bindBuffer(gl.ARRAY_BUFFER, model.vertices);
            gl.vertexAttribPointer(program.vertexPosition, 3, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ARRAY_BUFFER, model.textureMap);
            gl.vertexAttribPointer(program.vertexTexture, 2, gl.FLOAT, false, 0, 0);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model.triangles);

            var perspectiveMatrix = makePerspective(45, aspect, 1, 1000.0);
            var transformMatrix = model.getTransforms();

            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, model.image);

            gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

            var pMatrix = gl.getUniformLocation(program, "perspectiveMatrix");
            gl.uniformMatrix4fv(pMatrix, false, new Float32Array(perspectiveMatrix));

            var tMatrix = gl.getUniformLocation(program, "transformationMatrix");
            gl.uniformMatrix4fv(tMatrix, false, new Float32Array(transformMatrix));

            gl.drawElements(gl.TRIANGLES, model.triangleCount, gl.UNSIGNED_SHORT, 0);

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

        app.objekti = new app.Object(app.puudg.verticePosition, app.puudg.triangles, app.puudg.texturePosition, "minipudge_color.png");

        console.log(app.cube.vertices.length);
        console.log(app.cube4.vertices.length);
        console.log(app.cube.triangles.length);
        console.log(app.cube4.triangles.length);
        console.log(app.cube.texture.length);
        console.log(app.cube4.texture.length);

        app.lattia = new app.Object(app.floor.vertices, app.floor.triangles, app.floor.texture, "texture.png");

        app.lattia.pos.x = 0;
        app.lattia.pos.y = -16;
        app.lattia.pos.z = 100;

        app.lattia.scale.x = 1;
        app.lattia.scale.y = 1;
        app.lattia.scale.z = 1;

        app.objekti.pos.x = 0;
        app.objekti.pos.y = 0;
        app.objekti.pos.z = 5;

        app.objekti.rotation.y = 0;

        app.objekti.scale.x = 1;
        app.objekti.scale.y = 1;
        app.objekti.scale.z = 1;

        app.objekti.pos.z = 100;
        app.objekti.pos.y = -20;

        //My Model Was a bit too big
        app.objekti.scale.x = 0.5;
        app.objekti.scale.y = 0.5;
        app.objekti.scale.z = 0.5;

        //And Backwards
        app.objekti.rotation.y = 180;

        var building;

        setTimeout(update, 33);

        LoadModel("minipudge", function (VerticeMap, Triangles, TextureMap) {
            building = new app.Object(VerticeMap, Triangles, TextureMap, "minipudge_color.png");

            building.pos.z = 100;
            building.pos.y = -20;

            //My Model Was a bit too big
            building.scale.x = 0.5;
            building.scale.y = 0.5;
            building.scale.z = 0.5;

            //And Backwards
            building.rotation.y = 180;

//            app.objekti = building;

            setTimeout(update, 33);
        });
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
        draw(app.lattia);
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

    function LoadModel(modelName, callback) {
        var Ajax = new XMLHttpRequest();
        Ajax.onreadystatechange = function () {
            if (Ajax.readyState === 4 && Ajax.status === 200) {
                //Parse Model Data
                var script = Ajax.responseText.split("\n");

                var vertices = [];
                var verticeMap = [];

                var triangles = [];

                var textures = [];
                var textureMap = [];

                var normals = [];
                var normalMap = [];

                var counter = 0;
                for (var property in script) {
                    if (script.hasOwnProperty(property)) {
                        var line = script[property];
                        var row;
                        //If Vertice Line
                        if (line.substring(0, 2) == "v ") {
                            row = line.substring(2).split(" ");
                            vertices.push({
                                X: parseFloat(row[0]),
                                Y: parseFloat(row[1]),
                                Z: parseFloat(row[2])
                            });
                        }
                        //Texture Line
                        else if (line.substring(0, 2) == "vt") {
                            row = line.substring(3).split(" ");
                            textures.push({
                                X: parseFloat(row[0]),
                                Y: parseFloat(row[1])
                            });
                        }
                        //Normals Line
                        else if (line.substring(0, 2) === "vn") {
                            row = line.substring(3).split(" ");
                            normals.push({
                                X: parseFloat(row[0]),
                                Y: parseFloat(row[1]),
                                Z: parseFloat(row[2])
                            });
                        }
                        //Mapping Line
                        else if (line.substring(0, 2) === "f ") {
                            row = line.substring(2).split(" ");
                            var index;
                            for (var T in row) {
                                //Remove Blank Entries
                                if (row[T] !== "") {
                                    //If this is a multi-value entry
                                    if (row[T].indexOf("/") != -1) {
                                        //Split the different values
                                        var TC = row[T].split("/");
                                        //Increment The Triangles Array
                                        triangles.push(counter);
                                        counter++;

                                        //Insert the Vertices
                                        index = parseInt(TC[0]) - 1;
                                        verticeMap.push(vertices[index].X);
                                        verticeMap.push(vertices[index].Y);
                                        verticeMap.push(vertices[index].Z);

                                        //Insert the Textures
                                        index = parseInt(TC[1]) - 1;
                                        textureMap.push(textures[index].X);
                                        textureMap.push(textures[index].Y);

                                        //If This Entry Has Normals Data
                                        if (TC.length > 2) {
                                            //Insert Normals
                                            index = parseInt(TC[2]) - 1;
                                            normalMap.push(normals[index].X);
                                            normalMap.push(normals[index].Y);
                                            normalMap.push(normals[index].Z);
                                        }
                                    }
                                    //For rows with just vertices
                                    else {
                                        triangles.push(counter); //Increment The Triangles Array
                                        counter++;
                                        index = parseInt(row[T]) - 1;
                                        verticeMap.push(vertices[index].X);
                                        verticeMap.push(vertices[index].Y);
                                        verticeMap.push(vertices[index].Z);
                                    }
                                }
                            }
                        }
                    }
                }
                //Return The Arrays
                callback(verticeMap, triangles, textureMap, normalMap);
            }
        };
        Ajax.open("GET", modelName + ".obj", true);
        Ajax.send();
    }

    initialize();
    ready();
}(app));
