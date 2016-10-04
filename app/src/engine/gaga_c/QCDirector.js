var qc = require('./QCClass.js');
qc.g_NumberOfDraws = 0;
qc.defaultFPS=60;
qc.Director = qc.Class.extend({
    _animationInterval:null,
    _scenesStack:null,
    _lastUpdate:null,
    _frameRate:0,
    _purgeDirectorInNextLoop:false,
    invalid:false,
    _deltaTime:0,
    _nextScene:null,
    _runningScene:null,
    _sendCleanupToScene:false,
    _actionManager:null,
    ctor: function () {
        var self = this;
        self._lastUpdate = Date.now();
    },
    init: function () {
        // scenes
        this._animationInterval = 1.0 / qc.defaultFPS;
        this._scenesStack = [];
        this._lastUpdate = Date.now();
        this._actionManager = qc.ActionManager._getInstance();
        qc.log(this._actionManager)
        //Paused?
        this._paused = false;
        return true;
    },
    getWinSize:function(){
        return qc.size(qc._canvas.width,qc._canvas.height);
    },
    mainLoop: function () {
        if (this._purgeDirectorInNextLoop) {
            this._purgeDirectorInNextLoop = false;
            this.purgeDirector();
        }
        else if (!this.invalid) {
            this.drawScene();
        }
    },
    calculateDeltaTime: function () {
        var now = Date.now();
        this._deltaTime = (now - this._lastUpdate) / 1000;
        this._lastUpdate = now;
    },
    _clear : function () {
        var viewport = qc.rect(0,0,qc._canvas.width,qc._canvas.height);
        //qc._renderContext.clearRect(viewport.x, viewport.y, viewport.width, viewport.height);
        qc._renderContext.clearRect(-viewport.x, viewport.y, viewport.width, -viewport.height);
    },
    setNextScene: function () {//销毁当前运行的场景 进入下一场景
        var locRunningScene = this._runningScene;
        if (locRunningScene) {
            locRunningScene.onExit();
            locRunningScene.cleanup();
        }
        this._runningScene = this._nextScene;
        this._nextScene = null;
        this._runningScene.onEnter();
    },
    getActionManager:function(){
        return this._actionManager;
    },
    drawScene: function () {
        // calculate "global" dt
        this.calculateDeltaTime();
        //tick before glClear: issue #533
        if (!this._paused) {//定时器和事件侦听的分发
            //this._scheduler.update(this._deltaTime);
            this._actionManager.update(this._deltaTime);
            //qc.eventManager.dispatchEvent(this._eventAfterUpdate);
        }
        this._clear();//清屏
        if (this._nextScene) {
            this.setNextScene();
        }
        if (this._beforeVisitScene) this._beforeVisitScene();
        // draw the scene
        if (this._runningScene) {
            //qc.log("runningScene visit");
            this._runningScene.visit();
        }
        // draw the notifications node
//        if (this._notificationNode)
//            this._notificationNode.visit();
        if (this._afterVisitScene) this._afterVisitScene();
    },
    _beforeVisitScene:null,
    _afterVisitScene:null,
    purgeDirector:function(){
        //销毁director
    },
    pushScene: function (scene) {
        this._sendCleanupToScene = false;
        this._scenesStack.push(scene);
        this._nextScene = scene;
    },
    runScene: function (scene) {
        if (!this._runningScene) {
            //start scene
            this.pushScene(scene);
            //this.startAnimation();
        } else {
            //replace scene
            var i = this._scenesStack.length;
            if (i === 0) {
                this._sendCleanupToScene = true;
                this._scenesStack[i] = scene;
                this._nextScene = scene;
            } else {
                this._sendCleanupToScene = true;
                this._scenesStack[i - 1] = scene;
                this._nextScene = scene;
            }
        }
    }
});
qc.Director.sharedDirector = null;
qc.Director.firstUseDirector = true;
qc.Director._getInstance = function () {
    if (qc.Director.firstUseDirector) {
        qc.Director.firstUseDirector = false;
        qc.Director.sharedDirector = new qc.Director();
        qc.Director.sharedDirector.init();
    }
    return qc.Director.sharedDirector;
};
module.exports = qc;