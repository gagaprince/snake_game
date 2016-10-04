var qc = require('./QCClass.js');
qc.MoveTo = qc.Action.extend({
    desPos:null,
    startPos:null,
    allTime:0,
    speedX:0,
    speedY:0,
    _isDone:false,
    ctor:function(dtime,pos){
        this._super();
        this._duration = dtime;
        this.desPos = pos;
    },
    startWithTarget:function(target){
        this._super(target);
        this._isDone = false;
        this.startPos = target.getPosition();
        this.allTime = 0;
        this.speedX = (this.desPos.x-this.startPos.x)/this._duration;
        this.speedY = (this.desPos.y-this.startPos.y)/this._duration;
    },
    step:function(dt){
        var currentPos = this.target.getPosition();
        var newPos = qc.p(currentPos.x+this.speedX*dt,currentPos.y+this.speedY*dt);
        this.allTime+=dt;
        if(this.allTime>this._duration){
            newPos = this.desPos;
            this._isDone=true;
        }
        this.target.setPosition(newPos);
    },
    isDone:function(){
        return this._isDone;
    }
});
qc.MoveTo.create=function(dtime,pos){
    return new qc.MoveTo(dtime,pos);
}
qc.MoveBy = qc.MoveTo.extend({
    _movePos:null,
    ctor:function(dtime,disPos){
        this._super(dtime,disPos);
        this._movePos = disPos;
    },
    startWithTarget:function(target){
        var pos = target.getPosition();
        this.desPos = qc.p(pos.x+this._movePos.x,pos.y+this._movePos.y);
        this._super(target);
    }
});
qc.MoveBy.create=function(dtime,disPos){
    return new qc.MoveBy(dtime,disPos);
}
module.exports = qc;