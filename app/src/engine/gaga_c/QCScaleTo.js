var qc = require('./QCClass.js');
qc.ScaleTo = qc.Action.extend({
    _desScaleX:null,
    _desScaleY:null,
    _isDone:false,
    speedX:0,
    speedY:0,
    timesum:0,
    ctor:function(dtime,scaleX,scaleY){
        this._super();
        this._desScaleX = scaleX;
        this._desScaleY = scaleY||scaleX;
        this._duration = dtime;

    },
    startWithTarget:function(target){
        this._super(target);
        var nowScaleX = target.getScaleX();
        var nowScaleY = target.getScaleY();
        this.speedX = (this._desScaleX-nowScaleX)/this._duration;
        this.speedY = (this._desScaleY-nowScaleY)/this._duration;
        this.timesum = 0;
        this._isDone = false;
    },
    step:function(dt){
        this.timesum +=dt;
        var  newScaleX,newScaleY;
        var target = this.target;
        var nowScaleX = target.getScaleX();
        var nowScaleY = target.getScaleY();
        newScaleX=nowScaleX+this.speedX*dt;
        newScaleY=nowScaleY+this.speedY*dt;
        if(this.timesum>=this._duration){
            this._isDone = true;
            newScaleX = this._desScaleX;
            newScaleY = this._desScaleY;
        }
        this.target.setScale(newScaleX,newScaleY);
    },
    isDone:function(){
        return  this._isDone;
    }
});
qc.ScaleTo.create =function(dtime,des,scaleY){
    return new qc.ScaleTo(dtime,des,scaleY);
}
module.exports = qc;