var qc = require('./QCClass.js');
qc.Sprite = qc.Node.extend({
    _loadedEventListeners:null,
    _rect:null, //纹理的切片
    _rectRotated:false, //是否翻转
    addLoadedEventListener:function(callback, target){
        if(!this._loadedEventListeners)
            this._loadedEventListeners = [];
        this._loadedEventListeners.push({eventCallback:callback, eventTarget:target});
    },
    _callLoadedEventCallbacks:function(){
        if(!this._loadedEventListeners)
            return;
        var locListeners = this._loadedEventListeners;
        for(var i = 0, len = locListeners.length;  i < len; i++){
            var selCallback = locListeners[i];
            selCallback.eventCallback.call(selCallback.eventTarget, this);
        }
        locListeners.length = 0;
    },
    isTextureRectRotated:function () {
        return this._rectRotated;
    },
    getTextureRect:function () {
        return qc.rect(this._rect.x, this._rect.y, this._rect.width, this._rect.height);
    },
    sortAllChildren:function () {
        if (this._reorderChildDirty) {
            var _children = this._children;

            // insertion sort
            var len = _children.length, i, j, tmp;
            for(i=1; i<len; i++){
                tmp = _children[i];
                j = i - 1;

                while(j >= 0){
                    if(tmp._localZOrder < _children[j]._localZOrder){
                        _children[j+1] = _children[j];
                    }else if(tmp._localZOrder === _children[j]._localZOrder && tmp.arrivalOrder < _children[j].arrivalOrder){
                        _children[j+1] = _children[j];
                    }else{
                        break;
                    }
                    j--;
                }
                _children[j+1] = tmp;
            }
            this._reorderChildDirty = false;
        }

    },
    initWithFile:function (filename, rect) {
        qc.assert(filename, "把文件名传进来啊");
        var tex = qc.textureCache.textureForKey(filename);
        if (!tex) {
            tex = qc.textureCache.addImage(filename);
            return this.initWithTexture(tex, rect || qc.rect(0, 0, tex._contentSize.width, tex._contentSize.height));
        } else {
            if (!rect) {
                var size = tex.getContentSize();
                rect = qc.rect(0, 0, size.width, size.height);
            }
            return this.initWithTexture(tex, rect);
        }
    },
    _textureLoadedCallback:function(sender){
        var _t = this;
        if(_t._textureLoaded)
            return;
        _t._textureLoaded = true;
        var locRect = _t._rect;
        if (!locRect) {
            locRect = qc.rect(0, 0, sender.width, sender.height);
        } else if (qc._rectEqualToZero(locRect)) {
            locRect.width = sender.width;
            locRect.height = sender.height;
        }
        _t.texture = sender;
        _t._texture = sender;
        _t.setTextureRect(locRect, _t._rectRotated);
        _t._callLoadedEventCallbacks();
    },
    init : function () {
        var _t = this;
        if (arguments.length > 0)
            return _t.initWithFile(arguments[0], arguments[1]);
        qc.Node.prototype.init.call(_t);
        _t.texture = null;
        _t._textureLoaded = true;
        _t._anchorPoint = qc.p(0.5,0.5);
        _t.setTextureRect(qc.rect(0, 0, 0, 0), false, qc.size(0, 0));
        return true;
    },
    initWithTexture : function (texture, rect, rotated) {
        var _t = this;
        rotated = rotated || false;
        if (rotated && texture.isLoaded()) {//如果旋转了90度则在临时canvas中先将图片旋转
            var tempElement = texture.getHtmlElementObj();
            tempElement = qc.cutRotateImageToCanvas(tempElement, rect);
            var tempTexture = new qc.Texture2D();
            tempTexture.initWithElement(tempElement);
            tempTexture.handleLoadedTexture();
            texture = tempTexture;
            _t._rect = qc.rect(0, 0, rect.width, rect.height);
        }
        if (!qc.Node.prototype.init.call(_t))
            return false;
        _t._anchorPoint = qc.p(0.5,0.5);
        var locTextureLoaded = texture.isLoaded();
        _t._textureLoaded = locTextureLoaded;
        if (!locTextureLoaded) {
            _t._rectRotated = rotated;
            if (rect) {
                _t._rect.x = rect.x;
                _t._rect.y = rect.y;
                _t._rect.width = rect.width;
                _t._rect.height = rect.height;
            }
            texture.addLoadedEventListener(_t._textureLoadedCallback, _t);
            return true;
        }
        if (!rect) {
            rect = qc.rect(0, 0, texture.width, texture.height);
        }
        if(texture) {
            var _x = rect.x + rect.width, _y = rect.y + rect.height;
            if(_x > texture.width){
                qc.error("超出边界", texture.url);
            }
            if(_y > texture.height){
                qc.error("超出边界", texture.url);
            }
        }
        _t._originalTexture = texture;
        _t.texture = texture;
        _t._texture = texture;
        _t.setTextureRect(rect, rotated);
        return true;
    },
    initWithSpriteFrame:function (spriteFrame) {
        var rotated = spriteFrame._rotated;
        var ret = this.initWithTexture(spriteFrame.getTexture(), spriteFrame.getRect(), rotated);
        this.setSpriteFrame(spriteFrame);
        return ret;
    },
    setSpriteFrame:function(frame){//将当前的texture切换为frame中的texture;
        var newTexture = frame.getTexture();
        var rect = frame.getRect();
        var rotated = frame.isRotated();
        if(this._texture!=newTexture){
            this._texture = newTexture;
            this.texture = newTexture;
        }
        this.setTextureRect(rect,rotated);
    },
    setTextureRect : function (rect, rotated, untrimmedSize) {
        var _t = this;
        _t._rectRotated = rotated || false;
        var locTextureRect = _t._textureRect_Canvas;
        locTextureRect.x = 0 | (rect.x);
        locTextureRect.y = 0 | (rect.y);
        locTextureRect.width = 0 | (rect.width);
        locTextureRect.height = 0 | (rect.height);
        _t._rect = _t._textureRect_Canvas;
        _t.setContentSize(untrimmedSize || rect);
    },
    _softInit: function (fileName, rect, rotated) {
        if (fileName === undefined)
            qc.Sprite.prototype.init.call(this);
        else if (typeof(fileName) === "string") {
            if (fileName[0] === "#") {
                // Init with a sprite frame name
                var frameName = fileName.substr(1, fileName.length - 1);
               // var spriteFrame = qc.spriteFrameCache.getSpriteFrame(frameName);
                //this.initWithSpriteFrame(spriteFrame);
            } else {
                qc.Sprite.prototype.init.call(this, fileName, rect);
            }
        }
        else if (typeof(fileName) === "object") {
            this.initWithSpriteFrame(fileName);
            /*if (fileName instanceof qc.Texture2D) {
                // Init  with texture and rect
                this.initWithTexture(fileName, rect, rotated);
            } else if (fileName instanceof qc.SpriteFrame) {
                // Init with a sprite frame
                //this.initWithSpriteFrame(fileName);
            } else if ((fileName instanceof HTMLImageElement) || (fileName instanceof HTMLCanvasElement)) {
                // Init with a canvas or image element
                var texture2d = new qc.Texture2D();
                texture2d.initWithElement(fileName);
                texture2d.handleLoadedTexture();
                this.initWithTexture(texture2d);
            }*/
        }
    },
    ctor : function (fileName, rect, rotated) {
        var self = this;
        qc.Node.prototype.ctor.call(self);
        self._rect = qc.rect(0, 0, 0, 0);
        self._textureLoaded = true;
        self._textureRect_Canvas = {x: 0, y: 0, width: 0, height:0, validRect: false};
        self._softInit(fileName, rect, rotated);
    },
    draw : function (ctx) {
        var _t = this;
        if (!_t._textureLoaded)
            return;
        var context = ctx || qc._renderContext;
        var localTextureRect = _t._textureRect_Canvas;
        var anchorPoint = _t._anchorPoint;
        var anchorPointPoints = qc.p(anchorPoint.x*localTextureRect.width,anchorPoint.y*localTextureRect.height);
        var drawRect = qc.rect(-anchorPointPoints.x,-localTextureRect.height+anchorPointPoints.y,localTextureRect.width,localTextureRect.height);
        if(_t._texture){
            var image = _t._texture.getHtmlElementObj();
            context.drawImage(image,localTextureRect.x,localTextureRect.y,localTextureRect.width,localTextureRect.height,
                drawRect.x,drawRect.y,drawRect.width,drawRect.height);
        }
        qc.g_NumberOfDraws++;
    },
    getDrawRect:function(){
        var _t = this;
        var localTextureRect = _t._textureRect_Canvas;
        var anchorPoint = _t._anchorPoint;
        var anchorPointPoints = qc.p(anchorPoint.x*localTextureRect.width,anchorPoint.y*localTextureRect.height);
        return qc.rect(-anchorPointPoints.x,-anchorPointPoints.y,localTextureRect.width,localTextureRect.height);
    },
    isContain:function(pos){
        var rect = this.getDrawRect();
        var position = this.getPosition();
        var left = position.x+rect.x;
        var right = left+rect.width;
        var bottom = position.y+rect.y;
        var top = bottom+rect.height;
        if(pos.x>left&&pos.x<right&&pos.y>bottom&&pos.y<top){
            return true;
        }
        return false;
    }
});
qc.Sprite.create = function (fileName, rect, rotated) {
    return new qc.Sprite(fileName, rect, rotated);
};
qc.cutRotateImageToCanvas = function (texture, rect) {
    if (!texture)
        return null;

    if (!rect)
        return texture;

    var nCanvas = qc.newElement("canvas");
    nCanvas.width = rect.width;
    nCanvas.height = rect.height;
    var ctx = nCanvas.getContext("2d");
    ctx.translate(nCanvas.width / 2, nCanvas.height / 2);
    ctx.rotate(-1.5707963267948966);
    ctx.drawImage(texture, rect.x, rect.y, rect.height, rect.width, -rect.height / 2, -rect.width / 2, rect.height, rect.width);
    return nCanvas;
};

module.exports = qc;