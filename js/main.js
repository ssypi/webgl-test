var app = app || {};

(function (scope, undefined) {
    "use strict";

    app = scope;

    var canvas,
        gl,
        aspect,
        program;

    function initialize() {
        canvas = document.getElementById("mycanvas");
        aspect = canvas.width / canvas.height;
        if (!canvas.getContext("webgl") && !canvas.getContext("experimental-webgl")) {
            alert("Your browser doesn't support WebGL");
            return;
        }
        gl = (canvas.getContext("webgl")) ? canvas.getContext("webgl") : canvas.getContext("experimental-webgl");
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clearColor(0, 0, 0, 1);
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

    function draw(object, texture) {
        var vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.vertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.vertexPosition, 3, gl.FLOAT, false, 0, 0);

        var textureBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, textureBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(object.texture), gl.STATIC_DRAW);
        gl.vertexAttribPointer(program.vertexTexture, 2, gl.FLOAT, false, 0, 0);

        var triangleBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(object.triangles), gl.STATIC_DRAW);
//        gl.vertexAttribPointer(program.vertexPosition, 3, gl.FLOAT, false, 0, 0);

        var perspectiveMatrix = makePerspective(45, aspect, 1, 10000.0);
        var transformMatrix = makeTransform(object);

        gl.activeTexture(gl.TEXTURE0);

        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.uniform1i(gl.getUniformLocation(program, "uSampler"), 0);

        var pMatrix = gl.getUniformLocation(program, "perspectiveMatrix");
        gl.uniformMatrix4fv(pMatrix, false, new Float32Array(perspectiveMatrix));

        var tMatrix = gl.getUniformLocation(program, "transformationMatrix");
        gl.uniformMatrix4fv(tMatrix, false, new Float32Array(transformMatrix));

        gl.drawElements(gl.TRIANGLES, object.triangles.length, gl.UNSIGNED_SHORT, 0);
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

    function makeTransform(object) {
        var y = object.rotation * (Math.PI / 180.0);
        var A = Math.cos(y);
        var B = -1 * Math.sin(y);
        var C = Math.sin(y);
        var D = Math.cos(y);
//        object.rotation += 2;
        return [
            A, 0, B, 0,
            0, 1, 0, 0,
            C, 0, D, 0,
            0, 0, -6, 1
        ];
    }

    var texture;

    function ready() {
        var textureImage = new Image();
        textureImage.onload = function() {
            console.log("texture loaded");
            texture = loadTexture(textureImage);
            setInterval(update, 33);
//            draw(cube, texture);
        };
        textureImage.src = "texture.png";
    }

    function update() {
        app.inputManager.update();
        gl.clear(16384 | 256);
        draw(app.cube, texture);
    }

    initialize();
    ready();
}(app));
