var qc = require('./QCClass.js');
qc.Layer = qc.Node.extend(/** @lends qc.Layer# */{
    _isBaked: false,
    _bakeSprite: null,
    _className: "Layer",

    ctor: function () {
        var nodep = qc.Node.prototype;
        nodep.ctor.call(this);
        this._ignoreAnchorPointForPosition = true;
        nodep.setAnchorPoint.call(this, 0.5, 0.5);
        nodep.setContentSize.call(this, qc.winSize);
    },
    bake:null,
    unbake: null,
    isBaked: function(){
        return this._isBaked;
    },
    visit: function(ctx){
        if(!this._isBaked){
            qc.Node.prototype.visit.call(this, ctx);
            return;
        }
    },
    translateToLayer:function(location){
        var pos = this.getPosition();
        return qc.p(location.x-pos.x,location.y-pos.y);
    }
});
qc.Layer.create = function () {
    return new qc.Layer();
};

module.exports = qc;