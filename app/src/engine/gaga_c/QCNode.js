var qc = require('./QCClass.js');
/*qcNode是所有模型的根节点*/
qc.Node = qc.Class.extend({//qcNode 继承于 Class类
    _localZOrder: 0,   //z轴层次
    _position:null,//节点位置
    _anchorPoint:null,//锚点位置
    _rotationX: 0,      //x方向角度
    _rotationY: 0.0,    //y方向角度
    _rotationRadiansX:0,//x方向弧度
    _rotationRadiansY:0,//y方向弧度
    _scaleX: 1.0,       //x方向放大率
    _scaleY: 1.0,       //y方向放大率
    _children: null,   //孩子节点数组
    _visible: true,     //是否可见
    _parent: null,      //父亲节点
    tag:null,           //当前对象的唯一标示
    name:null,          //当前node的name 可以方便查询
    userData: null,    //附加对象
    _className: "Node", //类属性名称
    _contentSize:null, //所占区域大小
    _initializedNode:false, //是否已经初始化
    _running:false,     //是否在run
    _cacheDirty: true,  //还不知道这是什么意思
    _anchorPointInPoints:null,//实际锚点坐标
    _transform:null,   //坐标变化矩阵
    _skewX: 0.0,
    _skewY: 0.0,        //倾斜度
    _ignoreAnchorPointForPosition:false,
    _additionalTransform:null,  //附加变换矩阵
    _transformDirty:false,    //当需要改变坐标时 改动此值
    _reorderChildDirty:false,//需要重新排列child
    _initNode: function () {//初始化节点
        var _t = this;
        _t._anchorPoint = qc.p(0, 0);
        _t._contentSize = qc.size(0, 0);
        _t._position = qc.p(0, 0);
        _t._children = [];
        _t._initializedNode =true;
        _t._anchorPointInPoints=qc.p(0,0);
        _t._transform = {a: 1, b: 0, c: 0, d: 1, tx: 0, ty: 0};
        _t._additionalTransform = qc.AffineTransformMakeIdentity();
        var director = qc.director;
        _t.actionManager = director.getActionManager();
        /*_t._scheduler = director.getScheduler();
        _t._initializedNode = true;
        _t._additionalTransform = cc.AffineTransformMakeIdentity();
        if (cc.ComponentContainer) {
            _t._componentContainer = new cc.ComponentContainer(_t);
        }*/
    },
    ctor:function(){
        this._initNode();
    },
    init:function(){
        if (this._initializedNode === false)
            this._initNode();
        return true;
    },
    setRotation: function (newRotation) {//设置角度
        this._rotationX = this._rotationY = newRotation;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this._rotationRadiansY = this._rotationY * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },
    setRotationX: function (rotationX) {//设置x角度
        this._rotationX = rotationX;
        this._rotationRadiansX = this._rotationX * 0.017453292519943295; //(Math.PI / 180);
        this.setNodeDirty();
    },
    setRotationY: function (rotationY) {//设置y角度
        this._rotationY = rotationY;
        this._rotationRadiansY = this._rotationY * 0.017453292519943295;  //(Math.PI / 180);
        this.setNodeDirty();
    },
    setScale: function (scale, scaleY) {
        this._scaleX = scale;
        this._scaleY = (scaleY || scaleY === 0) ? scaleY : scale;
        this.setNodeDirty();
    },
    getScale:function(){
        return this._scaleX;
    },
    getScaleX: function () {
        return this._scaleX;
    },
    getScaleY: function () {
        return this._scaleY;
    },
    getRotationX: function () {
        return this._rotationX;
    },
    getRotationY: function () {
        return this._rotationY;
    },
    getSkewX: function () {
        return this._skewX;
    },
    setSkewX:function(newSkewX){
        this._skewX=newSkewX;
        this.setNodeDirty();
    },
    getSkewY:function(){
        return this._skewY;
    },
    setSkewY:function(newSkewY){
        this._skewY = newSkewY;
        this.setNodeDirty();
    },
    getPosition: function () {
        return qc.p(this._position);
    },
    setPosition: function (newPosOrxValue, yValue) {//设置位置
        var locPosition = this._position;
        if (yValue === undefined) {
            locPosition.x = newPosOrxValue.x;
            locPosition.y = newPosOrxValue.y;
        } else {
            locPosition.x = newPosOrxValue;
            locPosition.y = yValue;
        }
        this.setNodeDirty();
    },
    setNodeDirty:function(){
        var _t = this;
        //_t._setNodeDirtyForCache();
        _t._transformDirty === false && (_t._transformDirty = _t._inverseDirty = true);
    },
    getChildrenCount: function () {
        return this._children.length;
    },
    getChildren: function () {
        return this._children;
    },
    isVisible: function () {
        return this._visible;
    },
    setVisible: function (Var) {
        this._visible = Var;
        this.setNodeDirty();
    },
    getAnchorPoint: function () {
        return this._anchorPoint;
    },
    setAnchorPoint: function (point, y) {
        var locAnchorPoint = this._anchorPoint;
        if (y === undefined) {
            if ((point.x === locAnchorPoint.x) && (point.y === locAnchorPoint.y))
                return;
            locAnchorPoint.x = point.x;
            locAnchorPoint.y = point.y;
        } else {
            if ((point === locAnchorPoint.x) && (y === locAnchorPoint.y))
                return;
            locAnchorPoint.x = point;
            locAnchorPoint.y = y;
        }
        var locAPP = this._anchorPointInPoints, locSize = this._contentSize;
        locAPP.x = locSize.width * locAnchorPoint.x;
        locAPP.y = locSize.height * locAnchorPoint.y;
        this.setNodeDirty();
    },
    getContentSize: function () {//获取contentsize
        return this._contentSize;
    },
    setContentSize: function (size, height) {
        var locContentSize = this._contentSize;
        if (height === undefined) {
            if ((size.width === locContentSize.width) && (size.height === locContentSize.height))
                return;
            locContentSize.width = size.width;
            locContentSize.height = size.height;
        } else {
            if ((size === locContentSize.width) && (height === locContentSize.height))
                return;
            locContentSize.width = size;
            locContentSize.height = height;
        }
        var locAPP = this._anchorPointInPoints, locAnchorPoint = this._anchorPoint;
        locAPP.x = locContentSize.width * locAnchorPoint.x;
        locAPP.y = locContentSize.height * locAnchorPoint.y;
        this.setNodeDirty();
    },
    isRunning: function () {
        return this._running;
    },
    getParent: function () {
        return this._parent;
    },
    setParent: function (Var) {
        this._parent = Var;
    },
    getTag: function () {
        return this.tag;
    },
    setTag: function (Var) {
        this.tag = Var;
    },
    getName:function(){
        return this.name;
    },
    setName:function(name){
        this.name = name;
    },
    getUserData: function () {
        return this.userData;
    },
    setUserData: function (Var) {
        this.userData = Var;
    },
    getRotation: function () {
        return this._rotationX;
    },
    cleanup: function () {
        // actions
        this.stopAllActions();
//        this.unscheduleAllCallbacks();
//
//        // event
         qc.EventManager.removeListeners(this);
//
//        // timers
        this._arrayMakeObjectsPerformSelector(this._children, qc.Node.StateCallbackType.cleanup);
    },
    getChildByTag: function (aTag) {//根据tag寻找child
        var __children = this._children;
        if (__children != null) {
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node && node.tag == aTag)
                    return node;
            }
        }
        return null;
    },
    addChild: function (child, localZOrder, tag) {//添加一个孩子

        qc.assert(child, "child must be non-null");

        if (child === this) {
            qc.log("An Node can't be added as a child of itself.");
            return;
        }

        if (child._parent !== null) {
            qc.log("child already added. It can't be added again");
            return;
        }

        var tmpzOrder = (localZOrder != null) ? localZOrder : child._localZOrder;
        child.tag = (tag != null) ? tag : child.tag;
        this._insertChild(child, tmpzOrder);
        child._parent = this;

        (localZOrder !== null) && (this._reorderChildDirty=true);
       // this._cachedParent && (child._cachedParent = this._cachedParent);

        if (this._running) {
            child.onEnter();
            // prevent onEnterTransitionDidFinish to be called twice when a node is added in onEnter
//            if (this._isTransitionFinished)
//                child.onEnterTransitionDidFinish();
        }
    },
    removeFromParent: function (cleanup) {
        if (this._parent) {
            if (cleanup == null)
                cleanup = true;
            this._parent.removeChild(this, cleanup);
        }
    },
    removeChild: function (child, cleanup) {
        // explicit nil handling
        if (this._children.length === 0)
            return;

        if (cleanup == null)
            cleanup = true;
        if (this._children.indexOf(child) > -1)
            this._detachChild(child, cleanup);

        this.setNodeDirty();
    },
    removeChildByTag: function (tag, cleanup) {
        var child = this.getChildByTag(tag);
        if (child == null)
            qc.log("没有找到tag");
        else
            this.removeChild(child, cleanup);
    },
    removeAllChildren: function (cleanup) {
        // not using detachChild improves speed here
        var __children = this._children;
        if (__children != null) {
            if (cleanup == null)
                cleanup = true;
            for (var i = 0; i < __children.length; i++) {
                var node = __children[i];
                if (node) {
                    // IMPORTANT:
                    //  -1st do onExit
                    //  -2nd cleanup
                    if (this._running) {
                        node.onExitTransitionDidStart();
                        node.onExit();
                    }
                    if (cleanup)
                        node.cleanup();
                    // set parent nil at the end
                    node.parent = null;
                }
            }
            this._children.length = 0;
        }
    },
    sortAllChildren: function () {
        if (this._reorderChildDirty) {
            var _children = this._children;

            // insertion sort
            var len = _children.length, i, j, tmp;
            for(i=1; i<len; i++){
                tmp = _children[i];
                j = i - 1;

                //continue moving element downwards while zOrder is smaller or when zOrder is the same but mutatedIndex is smaller
                while(j >= 0){
                    if(tmp._localZOrder < _children[j]._localZOrder){
                        _children[j+1] = _children[j];
                    }else if(tmp._localZOrder === _children[j]._localZOrder && tmp.arrivalOrder < _children[j].arrivalOrder){
                        _children[j+1] = _children[j];
                    }else{
                        break;
                    }
                    j--;
                }
                _children[j+1] = tmp;
            }

            //don't need to check children recursively, that's done in visit of each child
            this._reorderChildDirty = false;
        }
    },
    _detachChild: function (child, doCleanup) {
        if (this._running) {
            //child.onExitTransitionDidStart();
            child.onExit();
        }
        if (doCleanup)
            child.cleanup();
        child.parent = null;
        qc.arrayRemoveObject(this._children, child);
    },
    onExit: function () {
        this._running = false;
        this.pause();
        this._arrayMakeObjectsPerformSelector(this._children, qc.Node.StateCallbackType.onExit);
        /*if (this._componentContainer) {
            this._componentContainer.removeAll();
        }*/
    },
    pause: function () {
//        this.scheduler.pauseTarget(this);
          this.actionManager && this.actionManager.pauseTarget(this);
//        cc.eventManager.pauseTarget(this);
    },
    _arrayMakeObjectsPerformSelector: function (array, callbackType) {
        if (!array || array.length === 0)
            return;

        var i, len = array.length, node;
        var nodeCallbackType = qc.Node.StateCallbackType;
        switch (callbackType) {
            case nodeCallbackType.onEnter:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onEnter();
                }
                break;
            case nodeCallbackType.onExit:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onExit();
                }
                break;
            case nodeCallbackType.onEnterTransitionDidFinish:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onEnterTransitionDidFinish();
                }
                break;
            case nodeCallbackType.cleanup:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.cleanup();
                }
                break;
            case nodeCallbackType.updateTransform:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.updateTransform();
                }
                break;
            case nodeCallbackType.onExitTransitionDidStart:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.onExitTransitionDidStart();
                }
                break;
            case nodeCallbackType.sortAllChildren:
                for (i = 0; i < len; i++) {
                    node = array[i];
                    if (node)
                        node.sortAllChildren();
                }
                break;
            default :
                qc.assert(0, "没有这样的type");
                break;
        }
    },
    onEnter: function () {
        this._isTransitionFinished = false;
        this._running = true;//should be running before resumeSchedule
        this._arrayMakeObjectsPerformSelector(this._children, qc.Node.StateCallbackType.onEnter);//挨个执行onEnter
        this.resume();
    },
    resume: function () {
//        this.scheduler.resumeTarget(this);
          this.actionManager && this.actionManager.resumeTarget(this);
//        cc.eventManager.resumeTarget(this);
    },
    _insertChild: function (child, z) {
        this._children.push(child);
        child._setLocalZOrder(z);
    },
    setLocalZOrder: function (localZOrder) {
        this._localZOrder = localZOrder;
        if (this._parent)
            this._parent.reorderChild(this, localZOrder);
        //cc.eventManager._setDirtyForNode(this);
    },
    reorderChild: function (child, zOrder) {
        qc.assert(child, "child must be non-null");
        child._setLocalZOrder(zOrder);
        this.setNodeDirty();
        this._reorderChildDirty = true;
    },
    _setLocalZOrder: function (localZOrder) {
        this._localZOrder = localZOrder;
    },
    draw: function (ctx) {
        // override me
        // Only use- this function to draw your staff.
        // DON'T draw your stuff outside this method
    },
    runAction: function (action) {
//        cc.assert(action, cc._LogInfos.Node_runAction);
//
        this.actionManager.addAction(action, this, !this._running);
        return action;
    },
    stopAllActions: function () {
        this.actionManager && this.actionManager.removeAllActionsFromTarget(this);
    },

    stopAction: function (action) {
        this.actionManager.removeAction(action);
    },
    schedule: function (callback_fn, interval, repeat, delay) {
        interval = interval || 0;

        qc.assert(callback_fn, "回调函数是空");

        qc.assert(interval >= 0, "间隔时间必须大于0");

        repeat = (repeat == null) ? -1 : repeat;
        delay = delay || 0;

        //this.scheduler.scheduleCallbackForTarget(this, callback_fn, interval, repeat, delay, !this._running);
    },
    unscheduleAllCallbacks: function () {
        //this.scheduler.unscheduleAllCallbacksForTarget(this);
    },
    update: function (dt) {
//        if (this._componentContainer && !this._componentContainer.isEmpty())
//            this._componentContainer.visit(dt);
    },
    visit:function (ctx) {
        var _t = this;
        // quick return if not visible
        if (!_t._visible)
            return;

        //visit for canvas
        var context = ctx || qc._renderContext, i;
        var children = _t._children, child;
        context.save();
        _t.transform(context);
        var len = children.length;
        if (len > 0) {
            _t.sortAllChildren();
            // draw children zOrder < 0
            for (i = 0; i < len; i++) {
                child = children[i];
                if (child._localZOrder < 0)
                    child.visit(context);
                else
                    break;
            }
            _t.draw(context);
            for (; i < len; i++) {
                children[i].visit(context);
            }
        } else
            _t.draw(context);

        this._cacheDirty = false;
        _t.arrivalOrder = 0;
        context.restore();
    },
    transform:function (ctx) {
        // transform for canvas
        var context = ctx ||qc._renderContext;
        var _t = this;
        //context.translate(10,-10);
        context.translate(_t._position.x,-_t._position.y);
        context.scale(_t._scaleX,_t._scaleY);
        context.rotate(_t._rotationRadiansX);
        //var t = this.nodeToParentTransform();
        //context.transform(t.a, t.c, t.b, t.d, t.tx, -t.ty);
    },
    isIgnoreAnchorPointForPosition: function () {
        return this._ignoreAnchorPointForPosition;
    },

    ignoreAnchorPointForPosition: function (newValue) {
        if (newValue != this._ignoreAnchorPointForPosition) {
            this._ignoreAnchorPointForPosition = newValue;
            this.setNodeDirty();
        }
    },
    setAdditionalTransform: function (additionalTransform) {
        this._additionalTransform = additionalTransform;
        this._transformDirty = true;
        this._additionalTransformDirty = true;
    },
    nodeToParentTransform:function () {
        var _t = this;
        if (_t._transformDirty) {
            var t = _t._transform;// quick reference
            // base position
            t.tx = _t._position.x;
            t.ty = _t._position.y;

            // rotation Cos and Sin
            var Cos = 1, Sin = 0;
            if (_t._rotationX) {
                Cos = Math.cos(_t._rotationRadiansX);
                Sin = Math.sin(_t._rotationRadiansX);
            }

            // base abcd
            t.a = t.d = Cos;
            t.b = -Sin;
            t.c = Sin;

            var lScaleX = _t._scaleX, lScaleY = _t._scaleY;
            var appX = _t._anchorPointInPoints.x, appY = _t._anchorPointInPoints.y;

            // Firefox on Vista and XP crashes
            // GPU thread in case of scale(0.0, 0.0)
            var sx = (lScaleX < 0.000001 && lScaleX > -0.000001) ? 0.000001 : lScaleX,
                sy = (lScaleY < 0.000001 && lScaleY > -0.000001) ? 0.000001 : lScaleY;

            // skew
            if (_t._skewX || _t._skewY) {
                // offset the anchorpoint
                var skx = Math.tan(-_t._skewX * Math.PI / 180);
                var sky = Math.tan(-_t._skewY * Math.PI / 180);
                if(skx === Infinity){
                    skx = 99999999;
                }
                if(sky === Infinity){
                    sky = 99999999;
                }
                var xx = appY * skx * sx;
                var yy = appX * sky * sy;
                t.a = Cos + -Sin * sky;
                t.b = Cos * skx + -Sin;
                t.c = Sin + Cos * sky;
                t.d = Sin * skx + Cos;
                t.tx += Cos * xx + -Sin * yy;
                t.ty += Sin * xx + Cos * yy;
            }

            // scale
            if (lScaleX !== 1 || lScaleY !== 1) {
                t.a *= sx;
                t.c *= sx;
                t.b *= sy;
                t.d *= sy;
            }

            // adjust anchorPoint
            t.tx += Cos * -appX * sx + -Sin * appY * sy;
            t.ty -= Sin * -appX * sx + Cos * appY * sy;

            // if ignore anchorPoint
            if (_t._ignoreAnchorPointForPosition) {
                t.tx += appX;
                t.ty += appY;
            }

            if (_t._additionalTransformDirty) {
                _t._transform = qc.AffineTransformConcat(t, _t._additionalTransform);
                _t._additionalTransformDirty = false;
            }

            _t._transformDirty = false;
        }
        return _t._transform;
    }
});
qc.Node.StateCallbackType = {onEnter: 1, onExit: 2, cleanup: 3, onEnterTransitionDidFinish: 4, updateTransform: 5, onExitTransitionDidStart: 6, sortAllChildren: 7};
qc.Node.create = function () {
    return new qc.Node();
};

module.exports = qc;