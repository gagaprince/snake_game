var qc = require('./QCClass.js');
qc.Sequence = qc.Action.extend({
    _actions:null,
    hasStartAction2:false,
    _isDone:false,
    ctor:function (tempArray) {
        this._super();
        this._actions = [];

        var paramArray = (tempArray instanceof Array) ? tempArray : arguments;
        var last = paramArray.length - 1;
        if (last >= 0) {
            var prev = paramArray[0], action1;
            for (var i = 1; i < last; i++) {
                if (paramArray[i]) {
                    action1 = prev;
                    prev = qc.Sequence._actionOneTwo(action1, paramArray[i]);
                }
            }
            this.initWithTwoActions(prev, paramArray[last]);
        }
    },
    initWithTwoActions:function(action1,action2){
        var d = action1._duration + action2._duration;
        this.initWithDuration(d);
        this._actions[0] = action1;
        this._actions[1] = action2;
        return true;
    },
    initWithDuration:function(duration){
        this._duration = duration;
    },
    startWithTarget:function(target){
        this._super(target);
        this._actions[0].startWithTarget(target);
        this._isDone = false;
        this.hasStartAction2 = false;
    },
    step:function(dt){
        var action1 = this._actions[0];
        if(this.hasStartAction2){
            var action2 = this._actions[1];
            action2.step(dt);
            if(action2.isDone()){
                this._isDone=true;
            }
            return;
        }
        action1.step(dt);
        if(action1.isDone()){
            var action2 = this._actions[1];
            if(!this.hasStartAction2){
                action2.startWithTarget(this.target);
                action1.stop();
                this.hasStartAction2 = true;
            }
        }
    },
    isDone:function(){
        return this._isDone;
    }
});
qc.Sequence._actionOneTwo = function (actionOne, actionTwo) {
    var sequence = new qc.Sequence();
    sequence.initWithTwoActions(actionOne, actionTwo);
    return sequence;
};
qc.Sequence.create=function(tempArr){
    return new qc.Sequence(tempArr);
}
module.exports = qc;