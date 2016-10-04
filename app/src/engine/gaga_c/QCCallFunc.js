var qc = require('./QCClass.js');
qc.CallFunc = qc.Action.extend({
    callBack:null,
    callTarget:null,
    _isDone:false,
    ctor:function(fun,target){
        this._super();
        this.callBack = fun;
        this.callTarget = target;
        this._duration = 0;
    },
    startWithTarget:function(target){
        this._super(target);
        this.callBack.call(this.callTarget);
        this._isDone = true;
    },
    step:function(dt){},
    isDone:function(){
        return this._isDone;
    }
});
qc.CallFunc.create = function(fun,target){
    return new qc.CallFunc(fun,target);
}
module.exports = qc;