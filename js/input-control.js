var app = app || {};

(function (scope, undefined) {
    "use strict";

    app = scope;

    app.inputManager = new InputManager();
    app.inputManager.init();

    function InputManager() {
        var canvas = document.getElementById("mycanvas");

        var keys = [];

        function initialize() {
            window.addEventListener('keydown', handleKeyDown, false);
            window.addEventListener('keyup', handleKeyUp, false);
            canvas.addEventListener('mousemove', this.handleMouseMovement, true);
            canvas.addEventListener('mousedown', this.handleMouseDown, true);
            canvas.addEventListener('mouseup', this.handleMouseDown, true);
        }

        function handleKeyUp(event) {
            keys[event.keyCode] = false;
        }

        function handleKeyDown(event) {
            keys[event.keyCode] = true;
        }

        function processInput() {
            if (keys[37]) {
                // left
            }
            if (keys[38]) {
                // up
            }
            if (keys[39]) {
                // right
            }
            if (keys[40]) {
                // down
            }
        }

        return {
            init: initialize(),
            update: processInput()
        };
    }
}(app));