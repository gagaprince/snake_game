var qc = require('./QCClass.js');
qc.SpriteFrameCache = qc.Class.extend({
    _CCNS_REG1 : /^\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*$/,
    _CCNS_REG2 : /^\s*\{\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*,\s*\{\s*([\-]?\d+[.]?\d*)\s*,\s*([\-]?\d+[.]?\d*)\s*\}\s*\}\s*$/,

    _spriteFrames:null,
    _frameConfigCache:null,
    ctor:function(){
        //this._super();
        this._spriteFrames = [];
        this._frameConfigCache = [];
    },
    _getFrameConfig : function(url){//分析plist文件
        var dict = qc.loader.getRes(url);
        qc.loader.release(url);//release it in loader
        if(dict._inited){
            this._frameConfigCache[url] = dict;
            return dict;
        }
        var tempFrames = dict["frames"], tempMeta = dict["metadata"] || dict["meta"];
        var frames = {}, meta = {};
        var format = 0;
        if(tempMeta){//init meta
            var tmpFormat = tempMeta["format"];
            format = (tmpFormat.length <= 1) ? parseInt(tmpFormat) : tmpFormat;
            meta.image = tempMeta["textureFileName"] || tempMeta["textureFileName"] || tempMeta["image"];
        }
        for (var key in tempFrames) {
            var frameDict = tempFrames[key];
            if(!frameDict) continue;
            var tempFrame = {};

            if (format == 0) {
                tempFrame.rect = qc.rect(frameDict["x"], frameDict["y"], frameDict["width"], frameDict["height"]);
                tempFrame.rotated = false;
                tempFrame.offset = qc.p(frameDict["offsetX"], frameDict["offsetY"]);
                var ow = frameDict["originalWidth"];
                var oh = frameDict["originalHeight"];
                // check ow/oh
                if (!ow || !oh) {
                    qc.log("在 qcspriteFrameCache 37行");
                }
                // Math.abs ow/oh
                ow = Math.abs(ow);
                oh = Math.abs(oh);
                tempFrame.size = qc.size(ow, oh);
            } else if (format == 1 || format == 2) {
                tempFrame.rect = this._rectFromString(frameDict["frame"]);
                tempFrame.rotated = frameDict["rotated"] || false;
                tempFrame.offset = this._pointFromString(frameDict["offset"]);
                tempFrame.size = this._sizeFromString(frameDict["sourceSize"]);
            } else if (format == 3) {
                // get values
                var spriteSize = this._sizeFromString(frameDict["spriteSize"]);
                var textureRect = this._rectFromString(frameDict["textureRect"]);
                if (spriteSize) {
                    textureRect = qc.rect(textureRect.x, textureRect.y, spriteSize.width, spriteSize.height);
                }
                tempFrame.rect = textureRect;
                tempFrame.rotated = frameDict["textureRotated"] || false; // == "true";
                tempFrame.offset = this._pointFromString(frameDict["spriteOffset"]);
                tempFrame.size = this._sizeFromString(frameDict["spriteSourceSize"]);
                tempFrame.aliases = frameDict["aliases"];
            } else {
                var tmpFrame = frameDict["frame"], tmpSourceSize = frameDict["sourceSize"];
                key = frameDict["filename"] || key;
                tempFrame.rect = qc.rect(tmpFrame["x"], tmpFrame["y"], tmpFrame["w"], tmpFrame["h"]);
                tempFrame.rotated = frameDict["rotated"] || false;
                tempFrame.offset = qc.p(0, 0);
                tempFrame.size = qc.size(tmpSourceSize["w"], tmpSourceSize["h"]);
            }
            frames[key] = tempFrame;
        }
        var cfg = this._frameConfigCache[url] = {
            _inited : true,
            frames : frames,
            meta : meta
        };
        return cfg;
    },
    _rectFromString :  function (content) {
        var result = this._CCNS_REG2.exec(content);
        if(!result) return qc.rect(0, 0, 0, 0);
        return qc.rect(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]), parseFloat(result[4]));
    },
    _sizeFromString : function (content) {
        var result = this._CCNS_REG1.exec(content);
        if(!result) return qc.size(0, 0);
        return qc.size(parseFloat(result[1]), parseFloat(result[2]));
    },
    _pointFromString : function (content) {
        var result = this._CCNS_REG1.exec(content);
        if(!result) return qc.p(0,0);
        return qc.p(parseFloat(result[1]), parseFloat(result[2]));
    },
    addSpriteFrames: function (url, texture) {
        var dict = this._frameConfigCache[url] || qc.loader.getRes(url);
        if(!dict || !dict["frames"])
            return;
        var self = this;
        var frameConfig = self._frameConfigCache[url]||self._getFrameConfig(url);
        var frames = frameConfig.frames;
        texture = qc.textureCache.addImage(texture);
        var spriteFrames = self._spriteFrames;
        for (var key in frames) {
            var frame = frames[key];
            var spriteFrame = spriteFrames[key];
            if (!spriteFrame) {
                spriteFrame = qc.SpriteFrame.create(texture, frame.rect, frame.rotated);
                if (spriteFrame.isRotated()) {
                    var locTexture = spriteFrame.getTexture();
                    if (locTexture.isLoaded()) {
                        var tempElement = spriteFrame.getTexture().getHtmlElementObj();
                        tempElement = qc.cutRotateImageToCanvas(tempElement, spriteFrame.getRect());
                        var tempTexture = new qc.Texture2D();
                        tempTexture.initWithElement(tempElement);
                        tempTexture.handleLoadedTexture();
                        spriteFrame.setTexture(tempTexture);
                        var rect = spriteFrame._rect;
                        spriteFrame.setRect(qc.rect(0, 0, rect.width, rect.height));
                    }
                }
                spriteFrames[key] = spriteFrame;
            }
        }
    },
    addSpriteFrame:function(key,frame){
        this._spriteFrames[key] = frame;
    },
    getSpriteFrame:function(key){
        return this._spriteFrames[key];
    }
});
qc.SpriteFrameCache._instance=null;
qc.SpriteFrameCache._getInstance = function(){
    if(qc.SpriteFrameCache._instance==null){
        qc.SpriteFrameCache._instance = new qc.SpriteFrameCache();
    }
    return qc.SpriteFrameCache._instance;
}
module.exports = qc;