var qc = require('./QCClass.js');
qc.Action = qc.Class.extend(/** @lends qc.Action# */{
    //***********variables*************
    originalTarget:null,
    target:null,
    tag:1,
    _duration:null,
    ctor:function () {
        this.originalTarget = null;
        this.target = null;
        this.tag = qc.ACTION_TAG_INVALID;
    },

    isDone:function () {
        return true;
    },
    startWithTarget:function (target) {
        this.originalTarget = target;
        this.target = target;
    },
    stop:function () {
        this.target = null;
    },
    step:function (dt) {
        qc.log("[Action step]. override me");
    },
    update:function (time) {
        qc.log("[Action update]. override me");
    },
    getTarget:function () {
        return this.target;
    },
    setTarget:function (target) {
        this.target = target;
    },
    getOriginalTarget:function () {
        return this.originalTarget;
    },
    setOriginalTarget:function (originalTarget) {
        this.originalTarget = originalTarget;
    },
    getTag:function () {
        return this.tag;
    },
    setTag:function (tag) {
        this.tag = tag;
    }
});
module.exports = qc;