var qc = require("./QCClass.js");
qc.Event = qc.Class.extend(/** @lends qc.Event# */{
    _type: 0,                                   //  Event type
    _isStopped: false,                         //< whether the event has been stopped.
    _currentTarget: null,                       //< Current target
    _setCurrentTarget: function (target) {
        this._currentTarget = target;
    },
    ctor: function (type) {
        this._type = type;
    },
    getType: function () {
        return this._type;
    },
    stopPropagation: function () {
        this._isStopped = true;
    },
    isStopped: function () {
        return this._isStopped;
    },
    getCurrentTarget: function () {
        return this._currentTarget;
    }
});
qc.EventTouch = qc.Event.extend(/** @lends qc.EventTouch# */{
    _eventCode: 0,
    _touches: null,
    ctor: function (arr) {
        qc.Event.prototype.ctor.call(this, qc.Event.TOUCH);
        this._touches = arr || [];
    },
    getEventCode: function () {
        return this._eventCode;
    },
    getTouches: function () {
        return this._touches;
    },
    _setEventCode: function (eventCode) {
        this._eventCode = eventCode;
    },
    _setTouches: function (touches) {
        this._touches = touches;
    }
});
qc.Event.TOUCH = 0;
qc.EventTouch.EventCode = {BEGAN: 0, MOVED: 1, ENDED: 2, CANCELLED: 3};

module.exports = qc;