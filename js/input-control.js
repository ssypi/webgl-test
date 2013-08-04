var app = app || {};

(function (scope, undefined) {
    "use strict";

    var SPEED = 0.5;

    var app = scope;

    app.inputManager = new InputManager();
    app.inputManager.init();

    function InputManager() {
        var canvas = document.getElementById("mycanvas");

        var keys = [];

        function initialize() {
            window.addEventListener('keydown', handleKeyDown, false);
            window.addEventListener('keyup', handleKeyUp, false);
//            canvas.addEventListener('mousemove', handleMouseMovement, true);
//            canvas.addEventListener('mousedown', handleMouseDown, true);
//            canvas.addEventListener('mouseup', handleMouseDown, true);
        }

        function handleKeyUp(event) {
            keys[event.keyCode] = false;
        }

        function handleKeyDown(event) {
            keys[event.keyCode] = true;
        }

        function processInput(object) {
            var radians = (object.rotation.y + 90) * (Math.PI / 180 );
            if (keys[37]) { // left
                object.rotation.y += 0.8;
            } else if (keys[39]) { // right
                object.rotation.y -= 0.8;
            }

            if (keys[32]) { // spacebar
                app.animaatio.applyFrame(4, app.objekti);
            }

            if (keys[38]) { // up
                object.pos.x = object.pos.x - SPEED * Math.cos(radians);
                object.pos.z = object.pos.z - SPEED * Math.sin(radians);
//                object.rotation.x -= 0.8;
            } else if (keys[40]) { // down
//                object.rotation.x += 0.8;
                object.pos.x = object.pos.x + SPEED * Math.cos(radians);
                object.pos.z = object.pos.z + SPEED * Math.sin(radians);
            }
        }

        return {
            init: initialize,
            update: processInput
        };
    }
}(app));