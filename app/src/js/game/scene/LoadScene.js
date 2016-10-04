var LoaderScene = qc.Scene.extend({
    _interval : null,
    _length : 0,
    _count : 0,
    _label : null,
    _className:"LoaderScene",
    init : function(){
        var self = this;

        //logo
        var logoWidth = 160;
        var logoHeight = 200;

        // bg
//        var bgLayer = self._bgLayer = qc.LayerColor.create(qc.color(32, 32, 32, 255));
//        bgLayer.setPosition(qc.visibleRect.bottomLeft);
//        self.addChild(bgLayer, 0);

        //image move to qcSceneFile.js
        var fontSize = 24, lblHeight =  -logoHeight / 2 + 100;
        //loading percent
//        var label = self._label = qc.LabelTTF.create("Loading... 0%", "Arial", fontSize);
//        label.setPosition(qc.pAdd(qc.visibleRect.center, qc.p(0, lblHeight)));
//        label.setColor(qc.color(180, 180, 180));
       // bgLayer.addChild(this._label, 10);
        return true;
    },

    _initStage: function (img, centerPos) {
        var self = this;
        var texture2d = self._texture2d = new qc.Texture2D();
        texture2d.initWithElement(img);
        texture2d.handleLoadedTexture();
        var logo = self._logo = qc.Sprite.create(texture2d);
        logo.setScale(qc.contentScaleFactor());
        logo.x = centerPos.x;
        logo.y = centerPos.y;
        self._bgLayer.addChild(logo, 10);
    },

    onEnter: function () {
        var self = this;
        qc.Node.prototype.onEnter.call(self);
        //self.schedule(self._startLoading, 0.3);
        self._startLoading();
    },

    onExit: function () {
        qc.Node.prototype.onExit.call(this);
        var tmpStr = "Loading... 0%";
        //this._label.setString(tmpStr);
    },

    /**
     * init with resources
     * @param {Array} resources
     * @param {Function|String} cb
     */
    initWithResources: function (resources, cb) {
        if(typeof resources == "string") resources = [resources];
        this.resources = resources || [];
        this.cb = cb;
    },

    _startLoading: function () {
        var self = this;
        //self.unschedule(self._startLoading);
        var res = self.resources;
        self._length = res.length;
        self._count = 0;
        qc.loader.load(res, function(result, count){ self._count = count; }, function(){
            if(self.cb)
                self.cb();
        });
        //self.schedule(self._updatePercent);
        //setInterval(self._updatePercent,100);
    },

    _updatePercent: function () {
        var self = this;
        var count = self._count;
        var length = self._length;
        var percent = (count / length * 100) | 0;
        percent = Math.min(percent, 100);
        qc.log(percent);
        //self._label.setString("Loading... " + percent + "%");
        //if(count >= length) self.unschedule(self._updatePercent);
    }
});
LoaderScene.preload = function(resources, cb){
    if(!this.loaderScene) {
        this.loaderScene = new LoaderScene();
        this.loaderScene.init();
    }
    this.loaderScene.initWithResources(resources, cb);
    qc.director.runScene(this.loaderScene);
    return this.loaderScene;
};

module.exports = LoaderScene;