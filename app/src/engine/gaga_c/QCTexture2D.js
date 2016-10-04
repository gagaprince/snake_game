var qc = require('./QCClass.js');
qc.Texture2D = qc.Class.extend({
    _contentSize: null,
    _isLoaded: false,
    _htmlElementObj: null,
    _loadedEventListeners: null,
    url: null,
    ctor: function () {
        this._contentSize = qc.size(0, 0);
        this._isLoaded = false;
        this._htmlElementObj = null;
    },
    initWithElement: function (element) {
        if (!element)
            return;
        this._htmlElementObj = element;
    },
    getContentSize:function(){
        return this._contentSize;
    },
    handleLoadedTexture:function () {
        var self = this
        if (self._isLoaded) return;
        if (!self._htmlElementObj) {
            var img = qc.loader.getRes(self.url);
            if (!img) return;
            self.initWithElement(img);
        }
        self._isLoaded = true;
        var locElement = self._htmlElementObj;
        self._contentSize.width = locElement.width;
        self._contentSize.height = locElement.height;
        self._callLoadedEventCallbacks();
    },
    releaseTexture:function(){//回收站自动回收
    },
    getHtmlElementObj: function () {
        return this._htmlElementObj;
    },
    isLoaded: function () {
        return this._isLoaded;
    },
    addLoadedEventListener: function (callback, target) {
        if (!this._loadedEventListeners)
            this._loadedEventListeners = [];
        this._loadedEventListeners.push({eventCallback: callback, eventTarget: target});
    },
    removeLoadedEventListener: function (target) {
        if (!this._loadedEventListeners)
            return;
        var locListeners = this._loadedEventListeners;
        for (var i = 0; i < locListeners.length; i++) {
            var selCallback = locListeners[i];
            if (selCallback.eventTarget == target) {
                locListeners.splice(i, 1);
            }
        }
    },
    _callLoadedEventCallbacks: function () {
        if (!this._loadedEventListeners)
            return;
        var locListeners = this._loadedEventListeners;
        for (var i = 0, len = locListeners.length; i < len; i++) {
            var selCallback = locListeners[i];
            selCallback.eventCallback.call(selCallback.eventTarget, this);
        }
        locListeners.length = 0;
    }
});

module.exports = qc;