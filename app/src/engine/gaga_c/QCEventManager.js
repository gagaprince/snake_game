var qc = require("./QCClass.js");
qc.EventManager = {
    _listeners: [],
    _isEnabled:true,       //是否可以工作
    addListener: function (listener, nodeOrPriority) {
        if(!(listener instanceof qc.EventListener)){
            listener = qc.EventListener.create(listener);
        } else {
            if(listener._isRegistered()){
                return;
            }
        }
        if (!listener.checkAvailable())
            return;
        if(typeof nodeOrPriority != "number"){
            listener._setPaused(false);
            listener.setEnabled(true);
            listener._setRegistered(true);
            listener._setSceneGraphPriority(nodeOrPriority);
        }
        this._listeners.push(listener);
    },
    removeListener: function (listener) {
        qc.log(listener)
        if (listener == null)
            return;
        var localListeners = this._listeners;
        var length = localListeners.length;
        for(var i=0;i<length;i++){
            if(listener==localListeners[i]){
                localListeners.splice(i,1);
                return;
            }
        }
    },
    dispatchEvent: function (event) {
        if (!this._isEnabled)
            return;
        if(!event || !event.getType)
            throw "event is undefined";
        if (event.getType() == qc.Event.TOUCH) {//touch事件就分发给touch
            this._dispatchTouchEvent(event);
            return;
        }
    },
    _dispatchTouchEvent:function(event){
        var localListeners = this._listeners;
        var originalTouches = event.getTouches();
        var oneByOneArgsObj = {event: event, touches: originalTouches, selTouch: null};
        if (localListeners) {
            for (var i = 0; i < originalTouches.length; i++) {
                oneByOneArgsObj.selTouch = originalTouches[i]; //当前分发的touch
                this._dispatchEventToListeners(localListeners, this._onTouchEventCallback, oneByOneArgsObj);
                if (event.isStopped())
                    return;
            }
        }
    },
    _dispatchEventToListeners: function (listeners, onEvent, eventOrArgs) {
        var len = listeners.length;
        for(var i=0;i<len;i++){
            var lis = listeners[i];
            if (lis.isEnabled() && !lis._isPaused() && lis._isRegistered() && onEvent(lis, eventOrArgs)) {
                break;
            }
        }
    },
    _onTouchEventCallback: function(listener, argsObj){
        // Skip if the listener was removed.
        if (!listener._isRegistered)
            return false;
        var event = argsObj.event, selTouch = argsObj.selTouch;
        event._setCurrentTarget(listener._node);

        var isClaimed = false, removedIdx; //isClaimed 意思是当begin响应返回true会继续接受move和end侦听 否则此listenner不在接受接下来的事件
        var getCode = event.getEventCode(), eventCode = qc.EventTouch.EventCode;
        if (getCode == eventCode.BEGAN) {
            if (listener.onTouchBegan) {
                listener.onTouchBegan(selTouch, event);
            }
        } else if (getCode === eventCode.MOVED && listener.onTouchMoved){
                listener.onTouchMoved(selTouch, event);
        } else if(getCode === eventCode.ENDED){
            if (listener.onTouchEnded)
                listener.onTouchEnded(selTouch, event);
        }
        if (event.isStopped()) {
            return true;
        }
        return false;
    },
    handleTouchesBegin: function (touches) {
        var touchEvent = new qc.EventTouch(touches);
        touchEvent._eventCode = qc.EventTouch.EventCode.BEGAN;
        this.dispatchEvent(touchEvent);
    },
    handleTouchesEnd: function(touches){
        var handleTouches = touches;
        if(handleTouches.length > 0) {
            var touchEvent = new qc.EventTouch(handleTouches);
            touchEvent._eventCode = qc.EventTouch.EventCode.ENDED;
            this.dispatchEvent(touchEvent);
        }
    },
    handleTouchesMove: function(touches){
        var handleTouches = touches;
        if(handleTouches.length > 0){
            var touchEvent = new qc.EventTouch(handleTouches);
            touchEvent._eventCode = qc.EventTouch.EventCode.MOVED;
            this.dispatchEvent(touchEvent);
        }
    },
    getHTMLElementPosition: function (element) {
        var docElem = document.documentElement;
        var win = window;
        var box = null;
        if (typeof element.getBoundingClientRect === 'function') {
            box = element.getBoundingClientRect();
        } else {
            if (element instanceof HTMLCanvasElement) {
                box = {
                    left: 0,
                    top: 0,
                    width: element.width,
                    height: element.height
                };
            } else {
                box = {
                    left: 0,
                    top: 0,
                    width: parseInt(element.style.width),
                    height: parseInt(element.style.height)
                };
            }
        }
        return {
            left: box.left + win.pageXOffset - docElem.clientLeft,
            top: box.top + win.pageYOffset - docElem.clientTop,
            width: box.width,
            height: box.height
        };
    },
    getPointByEvent: function(event, pos){
        if (event.pageX != null)  //not avalable in <= IE8
            return {x: event.pageX, y: event.pageY};

        pos.left -= document.body.scrollLeft;
        pos.top -= document.body.scrollTop;
        return {x: event.clientX, y: event.clientY};
    },
    getTouchByXY: function(tx, ty, pos){
        //这里要做坐标转换 tx ty都是相对浏览器左上角的 pos 指canvas的位置
        var location = this.convertToLocationInView(tx,ty,pos);
        var touch = new qc.Touch(location.x,location.y);
        return touch;
    },
    convertToLocationInView:function(tx,ty,pos){
        var winSize = qc.director.getWinSize();
        var winw = winSize.width;
        var winh = winSize.height;
        var left = pos.left;
        var top = pos.top;
        var posw = pos.width;
        var posh = pos.height;
        var rw = (tx-left)/posw*winw;
        var rh = (top+posh-ty)/posh*winh;
        return {x:rw,y:rh};
    },
    registerSystemEvent:function(element){
        var selfPointer = this;
        var supportMouse = ('mouse' in qc.sys.capabilities), supportTouches = ('touches' in qc.sys.capabilities);
        //register touch event
        if (supportMouse) {//如果支持鼠标事件 模拟touch
            //register canvas mouse event
            qc._addEventListener(element,"mousedown", function (event) {
                selfPointer._mousePressed = true;
                var pos = selfPointer.getHTMLElementPosition(element);
                var location = selfPointer.getPointByEvent(event, pos);
                if(!supportTouches)
                    selfPointer.handleTouchesBegin([selfPointer.getTouchByXY(location.x, location.y, pos)]);
                event.stopPropagation();
                event.preventDefault();
                element.focus();
            }, false);

            qc._addEventListener(element, "mouseup", function (event) {
                selfPointer._mousePressed = false;
                var pos = selfPointer.getHTMLElementPosition(element);
                var location = selfPointer.getPointByEvent(event, pos);
                if(!supportTouches)
                    selfPointer.handleTouchesEnd([selfPointer.getTouchByXY(location.x, location.y, pos)]);
                event.stopPropagation();
                event.preventDefault();
            }, false);

            qc._addEventListener(element, "mousemove", function (event) {
                //if(!selfPointer._mousePressed)
                //    return;

                var pos = selfPointer.getHTMLElementPosition(element);
                var location = selfPointer.getPointByEvent(event, pos);
                if(!supportTouches&&selfPointer._mousePressed)//不支持touch 且 鼠标按下
                    selfPointer.handleTouchesMove([selfPointer.getTouchByXY(location.x, location.y, pos)]);
                event.stopPropagation();
                event.preventDefault();
            }, false);
        }
        if(supportTouches) {
            //register canvas touch event
            qc._addEventListener(element,"touchstart", function (event) {
                qc.log("touchstart")
                if (!event.changedTouches) return;
                var pos = selfPointer.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                selfPointer.handleTouchesBegin(selfPointer.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
                element.focus();
            }, false);

            qc._addEventListener(element, "touchmove", function (event) {
                qc.log("touchstart")
                if (!event.changedTouches) return;
                var pos = selfPointer.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                selfPointer.handleTouchesMove(selfPointer.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
            }, false);

            qc._addEventListener(element, "touchend", function (event) {
                if (!event.changedTouches) return;
                var pos = selfPointer.getHTMLElementPosition(element);
                pos.left -= document.body.scrollLeft;
                pos.top -= document.body.scrollTop;
                selfPointer.handleTouchesEnd(selfPointer.getTouchesByEvent(event, pos));
                event.stopPropagation();
                event.preventDefault();
            }, false);
        }
    },
    removeListeners:function(scene){
        var id = scene.__instanceId;
        var liss = this._listeners;
        for(var i=0;i<liss.length;i++){
            var lis = liss[i];
            if(lis._node.__instanceId==id){
                lis.setEnabled(false);
                lis._setRegistered(false);
                liss.splice(i,1);
                i--;
            }
        }
    },
    isChildOfParent : function(node,id){
        if(node==null)return false;
        if(node.__instanceId!=id){
            return this.isChildOfParent(node.getParent(),id);
        }
    },
    getTouchesByEvent: function(event, pos){
        var touchArr = [];
        var touch_event, touch, preLocation;
        var length = event.changedTouches.length;
        for (var i = 0; i < length; i++) {
            touch_event = event.changedTouches[i];
            if (touch_event) {
                var location;
                if (qc.sys.BROWSER_TYPE_FIREFOX === qc.sys.browserType)
                    location = this.convertToLocationInView(touch_event.pageX, touch_event.pageY, pos);
                else
                    location = this.convertToLocationInView(touch_event.clientX, touch_event.clientY, pos);
                if (touch_event.identifier != null) {
                    touch = new qc.Touch(location.x, location.y, touch_event.identifier);
                } else {
                    touch = new qc.Touch(location.x, location.y);
                }
                touchArr.push(touch);
            }
        }
        return touchArr;
    }
}
module.exports = qc;

