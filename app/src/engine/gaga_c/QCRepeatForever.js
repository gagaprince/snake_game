var qc = require('./QCClass.js');
qc.RepeatForever = qc.Action.extend({
    selfAction:null,
    _isDone:false,
    _loops:null,
    _count:0,
    _duration:0,
    ctor:function(action,loops){
        this._super();
        this.selfAction = action;
        this._loops = loops;
    },
    startWithTarget:function(target){
        this._super(target);
        this.selfAction.startWithTarget(target);
        this._count=0;
        this._isDone = false;
    },
    step:function(dt){
        this.selfAction.step(dt);
        if(this.selfAction.isDone()){
            this._count++;
            if(this._loops&&this._count>=this._loops)
                this._isDone = true;
            else
                this.selfAction.startWithTarget(this.target);
        }
    },
    isDone:function(){
        return this._isDone;
    }
});
qc.RepeatForever.create = function(action,loops){
    return new qc.RepeatForever(action,loops);
}
module.exports = qc;