"use strict";
var LoaderScene = require('./game/scene/LoadScene.js');
var start_resources = require('./game/resource.js').start_resources;
var GameScene = require('./game/scene/GameScene.js');
qc.game.onStart = function(){
    LoaderScene.preload(start_resources,function(){
        var myGameScene = new GameScene();
        qc.director.runScene(myGameScene);
    });
};
qc.game.run();