var qc = require('./QCClass.js');
qc.Scene = qc.Node.extend({
    _className:"Scene",
    ctor:function () {
        qc.Node.prototype.ctor.call(this);
        this._ignoreAnchorPointForPosition = true;
        this.setAnchorPoint(0.5, 0.5);
        this.setContentSize(qc.director.getWinSize());
    }
});
qc.Scene.create = function () {
    return new qc.Scene();
};

module.exports = qc;