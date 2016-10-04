var qc = require('./QCClass.js');
qc.EventListener = qc.Class.extend(/** @lends qc.EventListener# */{
    _onEvent: null,                          // Event callback function
    _type: 0,                                 // Event listener type
    _registered: false,                     // Whether the listener has been added to dispatcher.

    _node: null,                           // scene graph based priority
    _paused: false,                        // Whether the listener is paused
    _isEnabled: true,                      // Whether the listener is enabled

    ctor: function (type, callback) {
        this._onEvent = callback;
        this._type = type || 0;
    },
    _setPaused: function (paused) {
        this._paused = paused;
    },
    _isPaused: function () {
        return this._paused;
    },
    _setRegistered: function (registered) {
        this._registered = registered;
    },
    _isRegistered: function () {
        return this._registered;
    },
    _getType: function () {
        return this._type;
    },
    _setSceneGraphPriority: function (node) {
        this._node = node;
    },
    _getSceneGraphPriority: function () {
        return this._node;
    },
    checkAvailable: function () {
        return this._onEvent != null;
    },
    clone: function () {
        return null;
    },
    setEnabled: function(enabled){
        this._isEnabled = enabled;
    },
    isEnabled: function(){
        return this._isEnabled;
    }
});

qc._EventListenerTouchOneByOne = qc.EventListener.extend({
    _claimedTouches: null,
    onTouchBegan: null,
    onTouchMoved: null,
    onTouchEnded: null,

    ctor: function () {
        qc.EventListener.prototype.ctor.call(null, null);
        this._claimedTouches = [];
    },
    clone: function () {
        var eventListener = new qc._EventListenerTouchOneByOne();
        eventListener.onTouchBegan = this.onTouchBegan;
        eventListener.onTouchMoved = this.onTouchMoved;
        eventListener.onTouchEnded = this.onTouchEnded;
        eventListener.onTouchCancelled = this.onTouchCancelled;
        eventListener.swallowTouches = this.swallowTouches;
        return eventListener;
    },
    checkAvailable: function () {
        if(!this.onTouchBegan){
            return false;
        }
        return true;
    }
});
qc.EventListener.TOUCH_ONE_BY_ONE=0;
qc.EventListener.create = function(argObj){
    var listenerType = argObj.event;
    var listener = new qc._EventListenerTouchOneByOne();
    for(var key in argObj) {
        listener[key] = argObj[key];
    }
    return listener;
};
module.exports = qc;