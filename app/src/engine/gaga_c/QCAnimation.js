var qc = require('./QCClass.js');
qc.Animation = qc.Class.extend({
    _frames:null,
    _delay:null,
    _loops:null,
    _currentIndex:null,
    _count:0,
    ctor:function(frames,delay,loops){
        this._frames = frames;
        this._delay = delay;
        this._loops = loops;
        this._currentIndex = -1;
        this._count = 0;
    },
    getLoops:function(){
        return this._loops;
    },
    getDelay:function(){
        return this._delay;
    },
    getFrames:function(){
        return this._frames;
    },
    addFrame:function(frame){
        this._frames.push(frame);
    },
    removeFrameByIndex:function(index){
        if(index<this._frames.length-1&&index>=0){
            this._frames.splice(index,1);
        }
    },
    getNextFrame:function(){//如果超过loops就返回空
        this._currentIndex++;
        if(this._currentIndex>=this._frames.length){
            this._currentIndex=0;
            this._count++;
            if(this._loops&&this._count>=this._loops){
                return null;
            }
        }
        return this._frames[this._currentIndex];
    }
});
qc.Animation.create = function(frames,delay,loops){
    return new qc.Animation(frames,delay,loops);
}
module.exports = qc;