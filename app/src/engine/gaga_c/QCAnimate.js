var qc = require('./QCClass.js');
qc.Animate = qc.Action.extend({
    _isDone:false,
    _animation:null,
    _delay:null,
    _timeSum:0,
    ctor:function(animation){
        this._super();
        this._animation = animation;
        this._delay = animation.getDelay();
    },
    startWithTarget:function(target){
        this._super(target);
        this._timeSum=0;
        this._isDone = false;
    },
    step:function(dt){
        this._timeSum+=dt;
        if(this._timeSum>this._delay){
            //需要切换帧
            var frame = this._animation.getNextFrame();
            if(frame==null){
                this._isDone = true;
                return;
            }
            this.target.setSpriteFrame(frame);
            this._timeSum-=parseInt(this._timeSum/this._delay)*this._delay;//将timesum做一次修正
        }
    },
    isDone:function(){
        return this._isDone;
    }
});
qc.Animate.create = function(animation){
    return new qc.Animate(animation);
}
module.exports = qc;