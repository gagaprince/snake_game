var qc = require('./QCClass.js');
qc._loadingImage="";//这里是loading图片地址 可以是base64
qc.newElement = function (x) {//新建一个元素
    return document.createElement(x);
};
qc._addEventListener = function (element, type, listener, useCapture) {//绑定事件
    element.addEventListener(type, listener, useCapture);
};
qc.each = function (obj, iterator, context) {//遍历执行iterator方法
    if (!obj)
        return;
    if (obj instanceof Array) {
        for (var i = 0, li = obj.length; i < li; i++) {
            if (iterator.call(context, obj[i], i) === false)
                return;
        }
    } else {
        for (var key in obj) {
            if (iterator.call(context, obj[key], key) === false)
                return;
        }
    }
};
qc.isCrossOrigin = function (url) {//判断url是否跨域
    if (!url) {
        qc.log("invalid URL");
        return false;
    }
    var startIndex = url.indexOf("://");
    if (startIndex == -1)
        return false;

    var endIndex = url.indexOf("/", startIndex + 3);
    var urlOrigin = (endIndex == -1) ? url : url.substring(0, endIndex);
    return urlOrigin != location.origin;
};
qc.path = {
    join: function () {//合并参数以/分割
        var l = arguments.length;
        var result = "";
        for (var i = 0; i < l; i++) {
            result = (result + (result == "" ? "" : "/") + arguments[i]).replace(/(\/|\\\\)$/, "");
        }
        return result;
    },
    extname: function (pathStr) {//获取扩展名
        var temp = /(\.[^\.\/\?\\]*)(\?.*)?$/.exec(pathStr);
        return temp ? temp[1] : null;
    },
    mainFileName: function(fileName){//获取主文件名 不带扩展名那部分
        if(fileName){
            var idx = fileName.lastIndexOf(".");
            if(idx !== -1)
                return fileName.substring(0,idx);
        }
        return fileName
    },
    basename: function (pathStr, extname) {//获取基础文件名 如果扩展名与参数相同不带扩展名 反之 带扩展名 不带path
        var index = pathStr.indexOf("?");
        if (index > 0) pathStr = pathStr.substring(0, index);
        var reg = /(\/|\\\\)([^(\/|\\\\)]+)$/g;
        var result = reg.exec(pathStr.replace(/(\/|\\\\)$/, ""));
        if (!result) return null;
        var baseName = result[2];
        if (extname && pathStr.substring(pathStr.length - extname.length).toLowerCase() == extname.toLowerCase())
            return baseName.substring(0, baseName.length - extname.length);
        return baseName;
    },
    dirname: function (pathStr) {//获取最深层文件夹
        return pathStr.replace(/((.*)(\/|\\|\\\\))?(.*?\..*$)?/, '$2');
    },
    changeExtname: function (pathStr, extname) {//将扩展名修改
        extname = extname || "";
        var index = pathStr.indexOf("?");
        var tempStr = "";
        if (index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        }
        index = pathStr.lastIndexOf(".");
        if (index < 0) return pathStr + extname + tempStr;
        return pathStr.substring(0, index) + extname + tempStr;
    },
    changeBasename: function (pathStr, basename, isSameExt) {//改变baseName
        if (basename.indexOf(".") == 0) return this.changeExtname(pathStr, basename);
        var index = pathStr.indexOf("?");
        var tempStr = "";
        var ext = isSameExt ? this.extname(pathStr) : "";
        if (index > 0) {
            tempStr = pathStr.substring(index);
            pathStr = pathStr.substring(0, index);
        }
        index = pathStr.lastIndexOf("/");
        index = index <= 0 ? 0 : index + 1;
        return pathStr.substring(0, index) + basename + ext + tempStr;
    }
};

qc.async = {//异步多任务完成策略 使用场景是 对一组异步任务 组内任务全部完成后 调用一个回调 中途有一个任务失败 则中断
    //计数器方法，当计数器归零时 说明组内任务完成 执行回调 出错则中断
    _counterFunc: function (err) {
        var counter = this.counter;
        if (counter.err)
            return;
        var length = counter.length;
        var results = counter.results;
        var option = counter.option;
        var cb = option.cb, cbTarget = option.cbTarget, trigger = option.trigger, triggerTarget = option.triggerTarget;
        if (err) {
            counter.err = err;
            if (cb)
                return cb.call(cbTarget, err);
            return;
        }
        var result = Array.apply(null, arguments).slice(1);
        var l = result.length;
        if (l == 0)
            result = null;
        else if (l == 1)
            result = result[0];
        results[this.index] = result;
        counter.count--;
        if (trigger)
            trigger.call(triggerTarget, result, length - counter.count, length);
        if (counter.count == 0 && cb)
            cb.apply(cbTarget, [null, results]);
    },
    _emptyFunc: function () {
    },
    //还没有研究
    parallel: function (tasks, option, cb) {
        var async = qc.async;
        if (cb !== undefined) {
            if (typeof option == "function")
                option = {trigger: option};
            option.cb = cb || option.cb;
        } else if (option !== undefined) {
            if (typeof option == "function")
                option = {cb: option};
        } else if (tasks !== undefined)
            option = {};
        else
            throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if (li == 0) {
            if (option.cb)
                option.cb.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length: li, count: li, option: option, results: results};

        qc.each(tasks, function (task, index) {
            if (counter.err)
                return false;
            var counterFunc = !option.cb && !option.trigger ? async._emptyFunc : async._counterFunc.bind({counter: counter, index: index});//bind counter and index
            task(counterFunc, index);
        });
    },
    //对一组异步tasks 分别执行option方法，全组执行完成后 调用cb
    map: function (tasks, option, cb) {
        var self = this;
        var len = arguments.length;
        if (typeof option == "function")
            option = {iterator: option};
        if (len === 3)
            option.cb = cb || option.cb;
        else if(len < 2)
            throw "arguments error!";
        if (typeof option == "function")
            option = {iterator: option};
        if (cb !== undefined)
            option.cb = cb || option.cb;
        else if (tasks === undefined )
            throw "arguments error!";
        var isArr = tasks instanceof Array;
        var li = isArr ? tasks.length : Object.keys(tasks).length;
        if (li === 0) {
            if (option.cb)
                option.cb.call(option.cbTarget, null);
            return;
        }
        var results = isArr ? [] : {};
        var counter = { length: li, count: li, option: option, results: results};
        qc.each(tasks, function (task, index) {
            if (counter.err)
                return false;
            var counterFunc = !option.cb ? self._emptyFunc : self._counterFunc.bind({counter: counter, index: index});//bind counter and index
            option.iterator.call(option.iteratorTarget, task, index, counterFunc);
        });
    }
};

qc.loader = {
    _jsCache: {},//cache for js
    _register: {},//register of loaders
    _langPathCache: {},//cache for lang path
    _aliases: {},//aliases for res url

    resPath: "",//root path of resource
    audioPath: "",//root path of audio
    cache: {},//cache for data loaded
    getXMLHttpRequest: function () {//或者xrq对象
        return window.XMLHttpRequest ? new window.XMLHttpRequest() : new ActiveXObject("MSXML2.XMLHTTP");
    },
    _getArgs4Js: function (args) {//整理要load的js参数
        var a0 = args[0], a1 = args[1], a2 = args[2], results = ["", null, null];
        if (args.length === 1) {
            results[1] = a0 instanceof Array ? a0 : [a0];
        } else if (args.length === 2) {
            if (typeof a1 == "function") {
                results[1] = a0 instanceof Array ? a0 : [a0];
                results[2] = a1;
            } else {
                results[0] = a0 || "";
                results[1] = a1 instanceof Array ? a1 : [a1];
            }
        } else if (args.length === 3) {
            results[0] = a0 || "";
            results[1] = a1 instanceof Array ? a1 : [a1];
            results[2] = a2;
        } else throw "arguments error to load js!";
        return results;
    },
    //异步加载一组js
    loadJs: function (baseDir, jsList, cb) {
        var self = this, localJsCache = self._jsCache,
            args = self._getArgs4Js(arguments);
        qc.async.map(args[1], function (item, index, cb1) {
            var jsPath = qc.path.join(args[0], item);
            if (localJsCache[jsPath]) return cb1(null);
            self._createScript(jsPath, false, cb1);
        }, args[2]);
    },
    //loadjs时同时加载一张图片 图片id cocos2d_loadJsImg js加载完成后 图片删除
    loadJsWithImg: function (baseDir, jsList, cb) {
        var self = this, jsLoadingImg = self._loadJsImg(),
            args = self._getArgs4Js(arguments);
        this.loadJs(args[0], args[1], function (err) {
            if (err) throw err;
            jsLoadingImg.parentNode.removeChild(jsLoadingImg);//remove loading gif
            if (args[2]) args[2]();
        });
    },
    //异步加载js
    _createScript: function (jsPath, isAsync, cb) {
        var d = document, self = this, s = qc.newElement('script');
        s.async = isAsync;
        s.src = jsPath;
        self._jsCache[jsPath] = true;
        qc._addEventListener(s, 'load', function () {
            this.removeEventListener('load', arguments.callee, false);
            cb();
        }, false);
        qc._addEventListener(s, 'error', function () {
            cb("Load " + jsPath + " failed!");
        }, false);
        d.body.appendChild(s);
    },
    _loadJsImg: function () {
        var d = document, jsLoadingImg = d.getElementById("loadJsImg");
        if (!jsLoadingImg) {
            jsLoadingImg = qc.newElement('img');

            if (qc._loadingImage)
                jsLoadingImg.src = qc._loadingImage;

            var canvasNode = d.getElementById(qc.game.config["id"]);
            canvasNode.style.backgroundColor = "black";
            canvasNode.parentNode.appendChild(jsLoadingImg);

            var canvasStyle = getComputedStyle ? getComputedStyle(canvasNode) : canvasNode.currentStyle;
            if (!canvasStyle)
                canvasStyle = {width: canvasNode.width, height: canvasNode.height};
            jsLoadingImg.style.left = canvasNode.offsetLeft + (parseFloat(canvasStyle.width) - jsLoadingImg.width) / 2 + "px";
            jsLoadingImg.style.top = canvasNode.offsetTop + (parseFloat(canvasStyle.height) - jsLoadingImg.height) / 2 + "px";
            jsLoadingImg.style.position = "absolute";
        }
        return jsLoadingImg;
    },
    //异步加载文本 同源
    loadTxt: function (url, cb) {
        var xhr = this.getXMLHttpRequest(),
            errInfo = "load " + url + " failed!";
        xhr.open("GET", url, true);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            xhr.setRequestHeader("Aqcept-Charset", "utf-8");
            xhr.onreadystatechange = function () {
                xhr.readyState == 4 && xhr.status == 200 ? cb(null, xhr.responseText) : cb(errInfo);
            };
        } else {
            if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
            xhr.onload = function () {
                xhr.readyState == 4 && xhr.status == 200 ? cb(null, xhr.responseText) : cb(errInfo);
            };
        }
        xhr.send(null);
    },
    //同步加载文本 同源
    _loadTxtSync: function (url) {
        var xhr = this.getXMLHttpRequest();
        xhr.open("GET", url, false);
        if (/msie/i.test(navigator.userAgent) && !/opera/i.test(navigator.userAgent)) {
            // IE-specific logic here
            xhr.setRequestHeader("Aqcept-Charset", "utf-8");
        } else {
            if (xhr.overrideMimeType) xhr.overrideMimeType("text\/plain; charset=utf-8");
        }
        xhr.send(null);
        if (!xhr.readyState == 4 || xhr.status != 200) {
            return null;
        }
        return xhr.responseText;
    },
    //将文本对象话
    loadJson: function (url, cb) {
        this.loadTxt(url, function (err, txt) {
            try {
                err ? cb(err) : cb(null, JSON.parse(txt));
            } catch (e) {
                throw "load json [" + url + "] failed : " + e;
            }
        });
    },
    //检测是否是图片
    _checkIsImageURL: function (url) {
        var ext = /(\.png)|(\.jpg)|(\.bmp)|(\.jpeg)|(\.gif)/.exec(url);
        return (ext != null);
    },
    loadImg: function (url, option, cb) {
        var opt = {
            isCrossOrigin: true
        };
        if (cb !== undefined) {
            opt.isCrossOrigin = option.isCrossOrigin == null ? opt.isCrossOrigin : option.isCrossOrigin;
        }
        else if (option !== undefined)
            cb = option;

        var img = new Image();
//        if (opt.isCrossOrigin && location.origin != "file://")
//            img.crossOrigin = "Anonymous";

        qc._addEventListener(img, "load", function () {
            this.removeEventListener('load', arguments.callee, false);
            this.removeEventListener('error', arguments.callee, false);
            if (cb)
                cb(null, img);
        });
        qc._addEventListener(img, "error", function () {
            this.removeEventListener('error', arguments.callee, false);
            if (cb)
                cb("load image failed");
        });
        img.src = url;
        return img;
    },

    /**
     * Iterator function to load res
     * @param {object} item
     * @param {number} index
     * @param {function} [cb]
     * @returns {*}
     * @private
     */
    //根据不同的类型 选取不同的加载器 加载内容
    _loadResIterator: function (item, index, cb) {
        var self = this, url = null;
        var type = item.type;
        if (type) {
            type = "." + type.toLowerCase();
            url = item.src ? item.src : item.name + type;
        } else {
            url = item;
            type = qc.path.extname(url);
        }
        var obj = self.cache[url];
        if (obj)
            return cb(null, obj);
        var loader = self._register[type.toLowerCase()];
        if (!loader) {
            qc.error("loader for [" + type + "] not exists!");
            return cb();
        }
        var basePath = loader.getBasePath ? loader.getBasePath() : self.resPath;
        var realUrl = self.getUrl(basePath, url);
        loader.load(realUrl, url, item, function (err, data) {
            if (err) {
                qc.log(err);
                self.cache[url] = null;
                delete self.cache[url];
                cb();
            } else {
                self.cache[url] = data;
                cb(null, data);
            }
        });
    },
    getUrl: function (basePath, url) {
        var self = this, langPathCache = self._langPathCache, path = qc.path;
        if (basePath !== undefined && url === undefined) {
            url = basePath;
            var type = path.extname(url);
            type = type ? type.toLowerCase() : "";
            var loader = self._register[type];
            if (!loader) basePath = self.resPath;
            else basePath = loader.getBasePath ? loader.getBasePath() : self.resPath;
        }
        url = qc.path.join(basePath || "", url)
        if (url.match(/[\/(\\\\)]lang[\/(\\\\)]/i)) {
            if (langPathCache[url]) return langPathCache[url];
            var extname = path.extname(url) || "";
            url = langPathCache[url] = url.substring(0, url.length - extname.length) + "_" + qc.sys.language + extname;
        }
        return url;
    },
    load: function (res, option, cb) {
        if (cb !== undefined) {
            if (typeof option == "function")
                option = {trigger: option};
        } else if (option !== undefined) {
            if (typeof option == "function") {
                cb = option;
                option = {};
            }
        } else if (res !== undefined)
            option = {};
        else
            throw "arguments error!";
        option.cb = function (err, results) {
            if (err)
                qc.log(err);
            if (cb)
                cb(results);
        };
        if (!(res instanceof Array))
            res = [res];
        option.iterator = this._loadResIterator;
        option.iteratorTarget = this;
        qc.async.map(res, option);
    },
    _handleAliases: function (fileNames, cb) {
        var self = this, aliases = self._aliases;
        var resList = [];
        for (var key in fileNames) {
            var value = fileNames[key];
            aliases[key] = value;
            resList.push(value);
        }
        this.load(resList, cb);
    },
    //资源文件列表存储在文本中 需要先读取文本 在加载
    loadAliases: function (url, cb) {
        var self = this, dict = self.getRes(url);
        if (!dict) {
            self.load(url, function (results) {
                self._handleAliases(results[0]["filenames"], cb);
            });
        } else self._handleAliases(dict["filenames"], cb);
    },
    //将加载器注册到load中
    register: function (extNames, loader) {
        if (!extNames || !loader) return;
        var self = this;
        if (typeof extNames == "string") return this._register[extNames.trim().toLowerCase()] = loader;
        for (var i = 0, li = extNames.length; i < li; i++) {
            self._register["." + extNames[i].trim().toLowerCase()] = loader;
        }
    },
    //从缓存中读取资源
    getRes: function (url) {
        return this.cache[url] || this.cache[this._aliases[url]];
    },
    //删除缓存
    release: function (url) {
        var cache = this.cache, aliases = this._aliases;
        delete cache[url];
        delete cache[aliases[url]];
        delete aliases[url];
    },
    //删除全部缓存
    releaseAll: function () {
        var loqcache = this.cache, aliases = this._aliases;
        for (var key in loqcache) {
            delete loqcache[key];
        }
        for (var key in aliases) {
            delete aliases[key];
        }
    }

};

qc.p = function (x, y) {
    // This can actually make use of "hidden classes" in JITs and thus decrease
    // memory usage and overall performance drastically
    // return cc.p(x, y);
    // but this one will instead flood the heap with newly allocated hash maps
    // giving little room for optimization by the JIT,
    // note: we have tested this item on Chrome and firefox, it is faster than cc.p(x, y)
    if (x == undefined)
        return {x: 0, y: 0};
    if (y == undefined)
        return {x: x.x, y: x.y};
    return {x: x, y: y};
};
qc.size = function (w, h) {
    // This can actually make use of "hidden classes" in JITs and thus decrease
    // memory usage and overall performance drastically
    //return cc.size(w, h);
    // but this one will instead flood the heap with newly allocated hash maps
    // giving little room for optimization by the JIT
    // note: we have tested this item on Chrome and firefox, it is faster than cc.size(w, h)
    if (w === undefined)
        return {width: 0, height: 0};
    if (h === undefined)
        return {width: w.width, height: w.height};
    return {width: w, height: h};
};
qc.rect = function (x, y, w, h) {
    if (x === undefined)
        return {x: 0, y: 0, width: 0, height: 0};
    if (y === undefined)
        return {x: x.x, y: x.y, width: x.width, height: x.height};
    return {x: x, y: y, width: w, height: h };
};
qc.color = function(r,g,b){
    return {r:r,g:g,b:b}
}
qc._formatString = function(arg){
    if(typeof arg === 'object'){
        try{
            return JSON.stringify(arg);
        }catch(err){
            return "";
        }
    }else{
        return arg;
    }
};
qc.assert = function (cond,msg) {
    if (!cond && msg) {
        throw msg;
    }
};
qc.log = function(msg){
    for (var i = 1; i < arguments.length; i++) {
        msg = msg.replace(/(%s)|(%d)/, qc._formatString(arguments[i]));
    }
    console.log(msg);
};
qc.warn = console.warn ?
    function(msg){
        for (var i = 1; i < arguments.length; i++) {
            msg = msg.replace(/(%s)|(%d)/, qc._formatString(arguments[i]));
        }
        console.warn(msg);
    } :
    qc.log;
qc.error = console.error ?
    function(msg){
        for (var i = 1; i < arguments.length; i++) {
            msg = msg.replace(/(%s)|(%d)/, qc._formatString(arguments[i]));
        }
        console.error(msg);
    } :
    qc.log;
qc.arrayRemoveObject = function (arr, delObj) {
    for (var i = 0, l = arr.length; i < l; i++) {
        if (arr[i] == delObj) {
            arr.splice(i, 1);
            break;
        }
    }
};
qc._rectEqualToZero = function(rect){
    return rect && (rect.x === 0) && (rect.y === 0) && (rect.width === 0) && (rect.height === 0);
};
qc._initSys = function (config, CONFIG_KEY) {
    qc._RENDER_TYPE_CANVAS = 0;
    var sys = qc.sys = {};
    sys.LANGUAGE_ENGLISH = "en";
    sys.LANGUAGE_CHINESE = "zh";
    sys.LANGUAGE_FRENCH = "fr";
    sys.LANGUAGE_ITALIAN = "it";
    sys.LANGUAGE_GERMAN = "de";
    sys.LANGUAGE_SPANISH = "es";
    sys.LANGUAGE_RUSSIAN = "ru";
    sys.LANGUAGE_KOREAN = "ko";
    sys.LANGUAGE_JAPANESE = "ja";
    sys.LANGUAGE_HUNGARIAN = "hu";
    sys.LANGUAGE_PORTUGUESE = "pt";
    sys.LANGUAGE_ARABIC = "ar";
    sys.LANGUAGE_NORWEGIAN = "no";
    sys.LANGUAGE_POLISH = "pl";
    sys.OS_WINDOWS = "Windows";
    sys.OS_IOS = "iOS";
    sys.OS_OSX = "OS X";
    sys.OS_UNIX = "UNIX";
    sys.OS_LINUX = "Linux";
    sys.OS_ANDROID = "Android";
    sys.OS_UNKNOWN = "Unknown";
    sys.BROWSER_TYPE_WECHAT = "wechat";
    sys.BROWSER_TYPE_ANDROID = "androidbrowser";
    sys.BROWSER_TYPE_IE = "ie";
    sys.BROWSER_TYPE_QQ = "qqbrowser";
    sys.BROWSER_TYPE_MOBILE_QQ = "mqqbrowser";
    sys.BROWSER_TYPE_UC = "ucbrowser";
    sys.BROWSER_TYPE_360 = "360browser";
    sys.BROWSER_TYPE_BAIDU_APP = "baiduboxapp";
    sys.BROWSER_TYPE_BAIDU = "baidubrowser";
    sys.BROWSER_TYPE_MAXTHON = "maxthon";
    sys.BROWSER_TYPE_OPERA = "opera";
    sys.BROWSER_TYPE_MIUI = "miuibrowser";
    sys.BROWSER_TYPE_FIREFOX = "firefox";
    sys.BROWSER_TYPE_SAFARI = "safari";
    sys.BROWSER_TYPE_CHROME = "chrome";
    sys.BROWSER_TYPE_UNKNOWN = "unknown";
    sys.isNative = false;


    var webglWhiteList = [sys.BROWSER_TYPE_BAIDU, sys.BROWSER_TYPE_OPERA, sys.BROWSER_TYPE_FIREFOX, sys.BROWSER_TYPE_CHROME, sys.BROWSER_TYPE_SAFARI];
    var multipleAudioWhiteList = [
        sys.BROWSER_TYPE_BAIDU, sys.BROWSER_TYPE_OPERA, sys.BROWSER_TYPE_FIREFOX, sys.BROWSER_TYPE_CHROME,
        sys.BROWSER_TYPE_SAFARI, sys.BROWSER_TYPE_UC, sys.BROWSER_TYPE_QQ, sys.BROWSER_TYPE_MOBILE_QQ, sys.BROWSER_TYPE_IE
    ];
    var win = window, nav = win.navigator, doc = document, docEle = doc.documentElement;
    var ua = nav.userAgent.toLowerCase();

    sys.isMobile = ua.indexOf('mobile') != -1 || ua.indexOf('android') != -1;

    var currLanguage = nav.language;
    currLanguage = currLanguage ? currLanguage : nav.browserLanguage;
    currLanguage = currLanguage ? currLanguage.split("-")[0] : sys.LANGUAGE_ENGLISH;
    sys.language = currLanguage;

    var browserType = sys.BROWSER_TYPE_UNKNOWN;
    var browserTypes = ua.match(/micromessenger|qqbrowser|mqqbrowser|ucbrowser|360browser|baiduboxapp|baidubrowser|maxthon|trident|opera|miuibrowser|firefox/i)
        || ua.match(/chrome|safari/i);
    if (browserTypes && browserTypes.length > 0) {
        browserType = browserTypes[0].toLowerCase();
        if (browserType == 'micromessenger') {
            browserType = sys.BROWSER_TYPE_WECHAT;
        } else if (browserType === "safari" && (ua.match(/android.*applewebkit/)))
            browserType = sys.BROWSER_TYPE_ANDROID;
        else if (browserType == "trident") browserType = sys.BROWSER_TYPE_IE;
    }
    sys.browserType = browserType;
    sys._supportMultipleAudio = multipleAudioWhiteList.indexOf(sys.browserType) > -1;

    var userRenderMode = parseInt(config[CONFIG_KEY.renderMode]);
    var renderType = qc._RENDER_TYPE_CANVAS;
    var tempCanvas = qc.newElement("Canvas");
    qc._supportRender = true;
    var notInWhiteList = webglWhiteList.indexOf(sys.browserType) == -1;
    if (userRenderMode === 1 || (userRenderMode === 0 && (sys.isMobile || notInWhiteList))) {
        renderType = qc._RENDER_TYPE_CANVAS;
    }
    if (renderType == qc._RENDER_TYPE_CANVAS) {
        try {
            tempCanvas.getContext("2d");
        } catch (e) {
            qc._supportRender = false;
        }
    }
    qc._renderType = renderType;

    try {
        sys._supportWebAudio = !!(new (win.AudioContext || win.webkitAudioContext || win.mozAudioContext)());
    } catch (e) {
        sys._supportWebAudio = false;
    }
    try {
        var localStorage = sys.localStorage = win.localStorage;
        localStorage.setItem("storage", "");
        localStorage.removeItem("storage");
        localStorage = null;
    } catch (e) {
        if (e.name === "SECURITY_ERR" || e.name === "QuotaExceededError") {
            qc.warn("Warning: localStorage isn't enabled. Please confirm browser cookie or privacy option");
        }
        sys.localStorage = function () {
        };
    }


    var capabilities = sys.capabilities = {"canvas": true};
    if (docEle['ontouchstart'] !== undefined || nav.msPointerEnabled)
        capabilities["touches"] = true;
    else if (docEle['onmouseup'] !== undefined)
        capabilities["mouse"] = true;
    if (docEle['onkeyup'] !== undefined)
        capabilities["keyboard"] = true;
    if (win.DeviceMotionEvent || win.DeviceOrientationEvent)
        capabilities["aqcelerometer"] = true;

    var iOS = ( ua.match(/(iPad|iPhone|iPod)/i) ? true : false );
    var isAndroid = ua.match(/android/i) || nav.platform.match(/android/i) ? true : false;
    var osName = sys.OS_UNKNOWN;
    if (nav.appVersion.indexOf("Win") != -1) osName = sys.OS_WINDOWS;
    else if (iOS) osName = sys.OS_IOS;
    else if (nav.appVersion.indexOf("Mac") != -1) osName = sys.OS_OSX;
    else if (nav.appVersion.indexOf("X11") != -1) osName = sys.OS_UNIX;
    else if (nav.appVersion.indexOf("Linux") != -1) osName = sys.OS_LINUX;
    else if (isAndroid) osName = sys.OS_ANDROID;
    sys.os = osName;

    sys.garbageCollect = function () {};
    sys.dumpRoot = function () {};
    sys.restartVM = function () {};

    sys.dump = function () {
        var self = this;
        var str = "";
        str += "isMobile : " + self.isMobile + "\r\n";
        str += "language : " + self.language + "\r\n";
        str += "browserType : " + self.browserType + "\r\n";
        str += "capabilities : " + JSON.stringify(self.capabilities) + "\r\n";
        str += "os : " + self.os + "\r\n";
        qc.log(str);
    }
};

qc.ORIENTATION_PORTRAIT = 0;
//头朝下
qc.ORIENTATION_PORTRAIT_UPSIDE_DOWN = 1;
//头向左
qc.ORIENTATION_LANDSCAPE_LEFT = 2;
//头向右
qc.ORIENTATION_LANDSCAPE_RIGHT = 3;
//渲染工具
qc._drawingUtil = null;
//渲染ctx
qc._renderContext = null;
//画布
qc._canvas = null;
//画布外层div
qc._gameDiv = null;
//渲染初始化标志
qc._rendererInitialized = false;
//是否setup标志 只setup一次
qc._setupCalled = false;
qc._setup = function (el, width, height) {
    if (qc._setupCalled) return;
    else qc._setupCalled = true;
    var win = window;
    win.requestAnimFrame = win.requestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.oRequestAnimationFrame ||
        win.msRequestAnimationFrame;
    var element = qc.$(el) || qc.$('#' + el);
    var localCanvas, localContainer, localConStyle, waicengContainer;
    if (element.tagName == "CANVAS") {
        width = width || element.width;
        height = height || element.height;

        waicengContainer = qc.newElement("DIV");
        waicengContainer.setAttribute('class','horizontal_center');

        localContainer = qc.container = qc.newElement("DIV");
        localCanvas = qc._canvas = element;
        localCanvas.parentNode.insertBefore(waicengContainer, localCanvas);
        localCanvas.parentNode.insertBefore(localContainer, localCanvas);
        qc.$(localContainer).appendTo(waicengContainer);
        localCanvas.appendTo(localContainer);
        localContainer.setAttribute('id', 'QCGameContainer');
    } else {
        if (element.tagName != "DIV") {
            qc.log("Warning: target element is not a DIV or CANVAS");
        }
        width = width || element.clientWidth;
        height = height || element.clientHeight;
        localContainer = qc.container = element;
        localCanvas = qc._canvas = qc.$(qc.newElement("CANVAS"));
        element.appendChild(localCanvas);
    }

    localCanvas.addClass("gameCanvas");
    localCanvas.setAttribute("width", width || 480);
    localCanvas.setAttribute("height", height || 320);
    localCanvas.setAttribute("tabindex", 99);
    localCanvas.style.outline = "none";
    var localCanStyle = localCanvas.style;
    localCanStyle.width = "100%";
    localCanStyle.height = "100%";
    localConStyle = localContainer.style;
    localConStyle.width = (width || 480) + "px";
    localConStyle.height = (height || 320) + "px";
    localConStyle.margin = "0 auto";

    localConStyle.position = 'relative';
    localConStyle.overflow = 'hidden';
    localContainer.top = '100%';
    qc._renderContext = localCanvas.getContext("2d");
    qc._mainRenderContextBackup = qc._renderContext;
    qc._renderContext.translate(0, localCanvas.height);
    //qc._drawingUtil = qc.DrawingPrimitiveCanvas ? new qc.DrawingPrimitiveCanvas(qc._renderContext) : null;

    qc._gameDiv = localContainer;

    if (qc.sys.isMobile) {
        var fontStyle = qc.newElement("style");
        fontStyle.type = "text/css";
        document.body.appendChild(fontStyle);

        fontStyle.textContent = "body,canvas,div{ -moz-user-select: none;-webkit-user-select: none;-ms-user-select: none;-khtml-user-select: none;"
            + "-webkit-tap-highlight-color:rgba(0,0,0,0);}";
    }

    var resizeCall =qc.resizeCall =  function(){
        var winWidth = window.innerWidth;
        var winHeight = window.innerHeight;
        var wbh = width/height;
        var wwbh = winWidth/winHeight;
        var rw , rh;
        if(wbh>wwbh){
            rw = winWidth;
            rh = winWidth/width*height;
        }else{
            rh = winHeight;
            rw = winHeight/height*width;
        }
        localConStyle.width = (rw || 480) + "px";
        localConStyle.height = (rh || 320) + "px";
        waicengContainer.style.width = "100%";
        waicengContainer.style.height=winHeight+"px";
    }
    resizeCall();
    window.addEventListener("resize",resizeCall,false);
    // Director
    qc.EventManager.registerSystemEvent(qc._canvas);
    qc.director = qc.Director._getInstance();
    qc.winSize = qc.director.getWinSize();
    qc.log(qc.winSize);

//    qc.saxParser = new qc.SAXParser();
//    qc.plistParser = new qc.PlistParser();
};
qc.game = {
    DEBUG_MODE_NONE: 0,
    DEBUG_MODE_INFO: 1,
    DEBUG_MODE_WARN: 2,
    DEBUG_MODE_ERROR: 3,
    DEBUG_MODE_INFO_FOR_WEB_PAGE: 4,
    DEBUG_MODE_WARN_FOR_WEB_PAGE: 5,
    DEBUG_MODE_ERROR_FOR_WEB_PAGE: 6,

    EVENT_HIDE: "game_on_hide",
    EVENT_SHOW: "game_on_show",
    _eventHide: null,
    _eventShow: null,
    _onBeforeStartArr: [],

    CONFIG_KEY: {
        engineDir: "engineDir",
        dependencies: "dependencies",
        debugMode: "debugMode",
        showFPS: "showFPS",
        frameRate: "frameRate",
        id: "id",
        renderMode: "renderMode",
        jsList: "jsList",
        classReleaseMode: "classReleaseMode"
    },
    _prepareCalled: false,//whether the prepare function has been called
    _prepared: false,//whether the engine has prepared
    _paused: true,//whether the game is paused

    _intervalId: null,//interval target of main
    config: null,

    onStart: null,

    onStop: null,

    setFrameRate: function (frameRate) {
        var self = this, config = self.config, CONFIG_KEY = self.CONFIG_KEY;
        config[CONFIG_KEY.frameRate] = frameRate;
        if (self._intervalId) clearInterval(self._intervalId);
        self._paused = true;
        self._runMainLoop();
    },

    _runMainLoop: function () {
        var self = this, callback, config = self.config, CONFIG_KEY = self.CONFIG_KEY,
            win = window, frameRate = config[CONFIG_KEY.frameRate],
            director = qc.director;
        //director.setDisplayStats(config[CONFIG_KEY.showFPS]);
//        if (win.requestAnimFrame && frameRate == 60) {
//            callback = function () {
//                if (!self._paused) {
//                    director.mainLoop();
//                    win.requestAnimFrame(callback);
//                }
//            };
//            win.requestAnimFrame(callback);
//        } else {
            callback = function () {
                director.mainLoop();
            };
            self._intervalId = setInterval(callback, 1000.0 / frameRate);
//        }
        self._paused = false;
    },
    stop:function(){
        if(this._intervalId){
            clearInterval(this._intervalId);
            this._intervalId = null;
        }
    },
    run: function (id) {
        var self = this;
        var _run = function () {
            if (id) {
                self.config[self.CONFIG_KEY.id] = id;
            }
            if (qc._supportRender) {
                qc._setup(self.config[self.CONFIG_KEY.id]);
                self._runMainLoop();
                /*self._eventHide = self._eventHide || new qc.EventCustom(self.EVENT_HIDE);
                self._eventHide.setUserData(self);
                self._eventShow = self._eventShow || new qc.EventCustom(self.EVENT_SHOW);
                self._eventShow.setUserData(self);*/
                self.onStart();
                self._checkPrepare = setInterval(function () {
                    clearInterval(self._checkPrepare);
                }, 10);
            }
        };
        document.body ?
            _run() :
            qc._addEventListener(window, 'load', function () {
                this.removeEventListener('load', arguments.callee, false);
                _run();
            }, false);
    },

    _initConfig: function () {
        var self = this, CONFIG_KEY = self.CONFIG_KEY;
        var _init = function (cfg) {
            cfg[CONFIG_KEY.engineDir] = cfg[CONFIG_KEY.engineDir] || "frameworks/qunar-c";
            cfg[CONFIG_KEY.frameRate] = cfg[CONFIG_KEY.frameRate] || 60;
            return cfg;
        };
        if (document["qcConfig"]) {
            self.config = _init(document["qcConfig"]);
        } else {
            try {
                var data = {
                    "project_type": "javascript",
                    "frameRate": 60,
                    "id": "gameCanvas",
                    "engineDir": "",
                    "jsList": []
                };
                self.config = _init(data || {});
            } catch (e) {
                qc.log("Failed to read or parse project.json");
                self.config = _init({});
            }
        }
        //init debug move to qcDebugger
        qc._initSys(self.config, CONFIG_KEY);
    },

    //cache for js and module that has added into jsList to be loaded.
    _jsAddedCache: {},
    _getJsListOfModule: function (moduleMap, moduleName, dir) {
        var jsAddedCache = this._jsAddedCache;
        if (jsAddedCache[moduleName]) return null;
        dir = dir || "";
        var jsList = [];
        var tempList = moduleMap[moduleName];
        if (!tempList) throw "can not find module [" + moduleName + "]";
        var qcPath = qc.path;
        for (var i = 0, li = tempList.length; i < li; i++) {
            var item = tempList[i];
            if (jsAddedCache[item]) continue;
            var extname = qcPath.extname(item);
            if (!extname) {
                var arr = this._getJsListOfModule(moduleMap, item, dir);
                if (arr) jsList = jsList.concat(arr);
            } else if (extname.toLowerCase() == ".js") jsList.push(qcPath.join(dir, item));
            jsAddedCache[item] = 1;
        }
        return jsList;
    }
};
qc.game._initConfig();

module.exports = qc;




