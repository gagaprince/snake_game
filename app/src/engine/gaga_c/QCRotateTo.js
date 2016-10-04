var qc = require('./QCClass.js');
qc.RotateTo = qc.Action.extend({
    desRotate:null,
    startRotate:null,
    allTime:0,
    speed:0,
    _isDone:false,
    ctor:function(dtime,rotate){
        this._super();
        this._duration = dtime;
        this.desRotate = rotate;
    },
    startWithTarget:function(target){
        this._super(target);
        this._isDone = false;
        this.startRotate = target.getRotation();
        this.allTime = 0;
        this.speed = (this.desRotate - this.startRotate)/this._duration;
    },
    step:function(dt){
        var currentRotate = this.target.getRotation();
        var newRotate = currentRotate+this.speed*dt;
        this.allTime+=dt;
        if(this.allTime>this._duration){
            newRotate = this.desRotate;
            this._isDone=true;
        }
        this.target.setRotation(newRotate);
    },
    isDone:function(){
        return this._isDone;
    }
});
qc.RotateTo.create = function(dtime,rotate){
    return new qc.RotateTo(dtime,rotate);
}
module.exports = qc;