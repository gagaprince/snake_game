var qc = require('./QCClass.js');
qc.SpriteFrame = qc.Class.extend({
    _rect:null,
    _texture:null,
    _rotated:false,
    ctor:function(){

    },
    initWithTexture : function (texture, rect, rotated) {
        var _t = this;
        rotated = rotated || false;
        _t._rect = rect;
        _t.texture = texture;
        _t._texture = texture;
        _t._rotated = rotated;
        return true;
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
    setTexture:function(texture){
        this._texture = texture;
    },
    getTexture:function(){
        return this._texture;
    },
    getRect:function(){
        return this._rect;
    },
    setRect:function(rect){
        this._rect = rect;
    },
    isRotated:function(){
        return this._rotated;
    }
});
qc.SpriteFrame.create = function(texture, rect, rotated){
    var s = new qc.SpriteFrame();
    s.initWithTexture(texture, rect, rotated)
    return s;
}
qc.SpriteFrame.createWithFile = function(file){
    var s = new qc.SpriteFrame();
    s.initWithFile(file);
    return s;
}

module.exports = qc;