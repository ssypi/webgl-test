/*globals multiplyMatrix*/
var app = app || {};

(function (scope, undefined) {
    "use strict";
    var app = scope;

    app.Animation = function () {

//        this.name = "";
//        this.duration;
//        this.frameRate;
//        this.frameCount;


        this.bones = []; // names / indexes of boneIds that are affected by the app.Animation


        this.boneIds = [];


        this.keyFrames = [
            [
                {
                    pos: [],
                    rot: [],
                    transformation : []
                },
                {
                    pos: [],
                    rot: []
                }
            ]
        ];
    };

    app.Animation.prototype.load = function (url, callback) {
        var self = this;

        var animationXhr = new XMLHttpRequest();
        animationXhr.open('GET', url + ".anim", true);
        animationXhr.onload = function() {
            // TODO: error handling
            var animation = JSON.parse(this.responseText);
            self.parseAnimation(animation);
            if (callback) { callback(self); }
        };
        animationXhr.send(null);
    };

    app.Animation.prototype.parseAnimation = function (animation) {
        this.name = animation.name;
        this.frameRate = animation.frameRate;
        this.duration = animation.duration;
        this.frameCount = animation.frameCount;
        this.keyFrames = [];
        this.bones = animation.bones;

        for(var i = 0; i < animation.keyFrames.length; i++) {
            this.keyFrames[i] = animation.keyFrames[i].transformations;
        }

//        this.keyFrames = animation.keyFrames;

        // Build a table to lookup bone id's
        for (i = 0; i < this.bones.length; ++i) {
            this.boneIds[this.bones[i]] = i;
        }
        this.ready = true;
        console.log("animation ready");
    };

    app.Animation.prototype.applyFrame = function (frameIndex, model) {
        var bones = model.bones;
        var boneNames = this.bones;

        if (!bones) {
            return;
        }

        console.log("applying animation");

        var frame = this.keyFrames[frameIndex-1];

        for(var i = 0; i < boneNames.length; ++i) {
            var bone = bones[i];
            var boneId = i;
//                boneId = boneNames.indexOf(bone.name);

//            console.log("nimi: " + bone.name + " id: " + boneId);

            if (boneId !== null) {
                var frameBone = frame[boneId];
//                console.log("frame: " + frameIndex);
//                console.log("org bone: " + bone.name + " xF: " + bone.transformationMatrix);
//                console.log("new xF: " + frameBone.values);
                bone.transformationMatrix = frameBone.values;
            } else {
                console.log("bone id is null: " + boneId);
                return;
            }

            if (bone.parent !== -1 && bone.parent !== undefined) {
                var parent = bones[bone.parent];
                bone.worldXForm = multiplyMatrix(parent.worldXForm, bone.transformationMatrix);
            } else {
                bone.worldXForm = bone.transformationMatrix;
            }

            bone.worldXForm = multiplyMatrix(bone.worldXForm, bone.inverseBind);

//        // We only need to compute the matrices for bones that actually have vertices assigned to them
//        if(bone.skinned) {
//            mat4.fromRotationTranslation(bone.worldRot, bone.worldPos, bone.boneMat);
//            mat4.multiply(bone.boneMat, bone.bindPoseMat);
//        }
//            model.bones[i] = bone;
        }
        model.dirtyBones = true; // Notify the model that it needs to update it's bone matrices
    };
})(app);
