var qc = require('./QCClass.js');
qc.HashElement = qc.Class.extend(/** @lends qc.HashElement# */{
    actions:null,
    target:null, //qcobject
    actionIndex:0,
    currentAction:null, //qcAction
    currentActionSalvaged:false,
    paused:false,
    hh:null, //ut hash handle
    ctor:function () {
        this.actions = [];
        this.target = null;
        this.actionIndex = 0;
        this.currentAction = null; //qcAction
        this.currentActionSalvaged = false;
        this.paused = false;
        this.hh = null; //ut hash handle
    }
});
qc.ActionManager = qc.Class.extend({
    _hashTargets:null,
    _arrayTargets:null,
    _currentTarget:null,
    _currentTargetSalvaged:false,

    _searchElementByTarget:function (arr, target) {
        for (var k = 0; k < arr.length; k++) {
            if (target == arr[k].target)
                return arr[k];
        }
        return null;
    },
    ctor:function () {
        this._hashTargets = {};
        this._arrayTargets = [];
        this._currentTarget = null;
        this._currentTargetSalvaged = false;
    },
    addAction:function (action, target, paused) {
        if(!action)
            throw "qc.ActionManager.addAction(): action must be non-null";
        if(!target)
            throw "qc.ActionManager.addAction(): action must be non-null";

        //check if the action target already exists
        var element = this._hashTargets[target.__instanceId];
        if (!element) {
            element = new qc.HashElement();
            element.paused = paused;
            element.target = target;
            this._hashTargets[target.__instanceId] = element;
            this._arrayTargets.push(element);
        }
        this._actionAllocWithHashElement(element);

        element.actions.push(action);
        action.startWithTarget(target);
    },

    removeAllActions:function () {
        var locTargets = this._arrayTargets;
        for (var i = 0; i < locTargets.length; i++) {
            var element = locTargets[i];
            if (element)
                this.removeAllActionsFromTarget(element.target, true);
        }
    },
    removeAllActionsFromTarget:function (target, forceDelete) {
        if (target == null)
            return;
        var element = this._hashTargets[target.__instanceId];
        if (element) {
            if (element.actions.indexOf(element.currentAction) !== -1 && !(element.currentActionSalvaged))
                element.currentActionSalvaged = true;

            element.actions.length = 0;
            if (this._currentTarget == element && !forceDelete) {
                this._currentTargetSalvaged = true;
            } else {
                this._deleteHashElement(element);
            }
        }
    },
    removeAction:function (action) {
        if (action == null)
            return;
        var target = action.getOriginalTarget();
        var element = this._hashTargets[target.__instanceId];

        if (element) {
            for (var i = 0; i < element.actions.length; i++) {
                if (element.actions[i] == action) {
                    element.actions.splice(i, 1);
                    break;
                }
            }
        } else {
            qc.log(qc._LogInfos.ActionManager_removeAction);
        }
    },
    removeActionByTag:function (tag, target) {
        var element = this._hashTargets[target.__instanceId];

        if (element) {
            var limit = element.actions.length;
            for (var i = 0; i < limit; ++i) {
                var action = element.actions[i];
                if (action && action.getTag() === tag && action.getOriginalTarget() == target) {
                    this._removeActionAtIndex(i, element);
                    break;
                }
            }
        }
    },
    getActionByTag:function (tag, target) {
        var element = this._hashTargets[target.__instanceId];
        if (element) {
            if (element.actions != null) {
                for (var i = 0; i < element.actions.length; ++i) {
                    var action = element.actions[i];
                    if (action && action.getTag() === tag)
                        return action;
                }
            }
        }
        return null;
    },
    numberOfRunningActionsInTarget:function (target) {
        var element = this._hashTargets[target.__instanceId];
        if (element)
            return (element.actions) ? element.actions.length : 0;

        return 0;
    },
    pauseTarget:function (target) {
        var element = this._hashTargets[target.__instanceId];
        if (element)
            element.paused = true;
    },
    resumeTarget:function (target) {
        var element = this._hashTargets[target.__instanceId];
        if (element)
            element.paused = false;
    },
    pauseAllRunningActions:function(){
        var idsWithActions = [];
        var locTargets = this._arrayTargets;
        for(var i = 0; i< locTargets.length; i++){
            var element = locTargets[i];
            if(element && !element.paused){
                element.paused = true;
                idsWithActions.push(element.target);
            }
        }
        return idsWithActions;
    },
    resumeTargets:function(targetsToResume){
        if(!targetsToResume)
            return;

        for(var i = 0 ; i< targetsToResume.length; i++){
            if(targetsToResume[i])
                this.resumeTarget(targetsToResume[i]);
        }
    },
    purgeSharedManager:function () {
        //qc.director.getScheduler().unscheduleUpdateForTarget(this);
    },

    //protected
    _removeActionAtIndex:function (index, element) {
        var action = element.actions[index];

        if ((action == element.currentAction) && (!element.currentActionSalvaged))
            element.currentActionSalvaged = true;

        element.actions.splice(index, 1);

        // update actionIndex in case we are in tick. looping over the actions
        if (element.actionIndex >= index)
            element.actionIndex--;

        if (element.actions.length == 0) {
            if (this._currentTarget == element) {
                this._currentTargetSalvaged = true;
            } else {
                this._deleteHashElement(element);
            }
        }
    },

    _deleteHashElement:function (element) {
        if (element) {
            delete this._hashTargets[element.target.__instanceId];
            qc.arrayRemoveObject(this._arrayTargets, element);
            element.actions = null;
            element.target = null;
        }
    },

    _actionAllocWithHashElement:function (element) {
        // 4 actions per Node by default
        if (element.actions == null) {
            element.actions = [];
        }
    },
    update:function (dt) {
        var locTargets = this._arrayTargets , loqcurrTarget;
        for (var elt = 0; elt < locTargets.length; elt++) {
            this._currentTarget = locTargets[elt];
            loqcurrTarget = this._currentTarget;
            if (!loqcurrTarget.paused) {
                for (loqcurrTarget.actionIndex = 0; loqcurrTarget.actionIndex < loqcurrTarget.actions.length;
                     loqcurrTarget.actionIndex++) {
                    loqcurrTarget.currentAction = loqcurrTarget.actions[loqcurrTarget.actionIndex];
                    if (!loqcurrTarget.currentAction)
                        continue;
                    loqcurrTarget.currentActionSalvaged = false;
                    //use for speed
                    loqcurrTarget.currentAction.step(dt * ( loqcurrTarget.currentAction._speedMethod ? loqcurrTarget.currentAction._speed : 1 ) );
                    if (loqcurrTarget.currentActionSalvaged) {
                        loqcurrTarget.currentAction = null;//release
                    } else if (loqcurrTarget.currentAction.isDone()) {
                        loqcurrTarget.currentAction.stop();
                        var action = loqcurrTarget.currentAction;
                        loqcurrTarget.currentAction = null;
                        this.removeAction(action);
                    }

                    loqcurrTarget.currentAction = null;
                }
            }
            if (this._currentTargetSalvaged && loqcurrTarget.actions.length === 0) {
                this._deleteHashElement(loqcurrTarget);
            }
        }
    }
});
qc.ActionManager.shareAcitonManager = null;
qc.ActionManager.firstUseManager = true;
qc.ActionManager._getInstance = function () {
    if (qc.ActionManager.shareAcitonManager==null) {
        qc.ActionManager.firstUseManager = false;
        qc.ActionManager.shareAcitonManager = new qc.ActionManager();
    }
    return qc.ActionManager.shareAcitonManager;
};
module.exports = qc;
