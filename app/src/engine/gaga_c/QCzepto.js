var qc = require('./QCClass.js');
//类jq选择框架
qc.$ = function (x) {
    var parent = (this == qc) ? document : this;
    var el = (x instanceof HTMLElement) ? x : parent.querySelector(x);
    if (el) {
        el.find = el.find || qc.$;
        el.hasClass = el.hasClass || function (cls) {
            return this.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
        };
        el.addClass = el.addClass || function (cls) {
            if (!this.hasClass(cls)) {
                if (this.className) {
                    this.className += " ";
                }
                this.className += cls;
            }
            return this;
        };
        el.removeClass = el.removeClass || function (cls) {
            if (this.hasClass(cls)) {
                this.className = this.className.replace(cls, '');
            }
            return this;
        };
        el.remove = el.remove || function () {
            if (this.parentNode)
                this.parentNode.removeChild(this);
            return this;
        };
        el.appendTo = el.appendTo || function (x) {
            x.appendChild(this);
            return this;
        };
        el.prependTo = el.prependTo || function (x) {
            ( x.childNodes[0]) ? x.insertBefore(this, x.childNodes[0]) : x.appendChild(this);
            return this;
        };
        el.transforms = el.transforms || function () {
            this.style[qc.$.trans] = qc.$.translate(this.position) + qc.$.rotate(this.rotation) + qc.$.scale(this.scale) + qc.$.skew(this.skew);
            return this;
        };

        el.position = el.position || {x: 0, y: 0};
        el.rotation = el.rotation || 0;
        el.scale = el.scale || {x: 1, y: 1};
        el.skew = el.skew || {x: 0, y: 0};
        el.translates = function (x, y) {
            this.position.x = x;
            this.position.y = y;
            this.transforms();
            return this
        };
        el.rotate = function (x) {
            this.rotation = x;
            this.transforms();
            return this
        };
        el.resize = function (x, y) {
            this.scale.x = x;
            this.scale.y = y;
            this.transforms();
            return this
        };
        el.setSkew = function (x, y) {
            this.skew.x = x;
            this.skew.y = y;
            this.transforms();
            return this
        };
    }
    return el;
};
//getting the prefix and css3 3d support
switch (qc.sys.browserType) {
    case qc.sys.BROWSER_TYPE_FIREFOX:
        qc.$.pfx = "Moz";
        qc.$.hd = true;
        break;
    case qc.sys.BROWSER_TYPE_CHROME:
    case qc.sys.BROWSER_TYPE_SAFARI:
        qc.$.pfx = "webkit";
        qc.$.hd = true;
        break;
    case qc.sys.BROWSER_TYPE_OPERA:
        qc.$.pfx = "O";
        qc.$.hd = false;
        break;
    case qc.sys.BROWSER_TYPE_IE:
        qc.$.pfx = "ms";
        qc.$.hd = false;
        break;
    default:
        qc.$.pfx = "webkit";
        qc.$.hd = true;
}
//cache for prefixed transform
qc.$.trans = qc.$.pfx + "Transform";
//helper function for constructing transform strings
qc.$.translate = (qc.$.hd) ? function (a) {
    return "translate3d(" + a.x + "px, " + a.y + "px, 0) "
} : function (a) {
    return "translate(" + a.x + "px, " + a.y + "px) "
};
qc.$.rotate = (qc.$.hd) ? function (a) {
    return "rotateZ(" + a + "deg) ";
} : function (a) {
    return "rotate(" + a + "deg) ";
};
qc.$.scale = function (a) {
    return "scale(" + a.x + ", " + a.y + ") "
};
qc.$.skew = function (a) {
    return "skewX(" + -a.x + "deg) skewY(" + a.y + "deg)";
};

qc.$new = function (x) {
    return qc.$(document.createElement(x))
};
qc.$.findpos = function (obj) {
    var curleft = 0;
    var curtop = 0;
    do {
        curleft += obj.offsetLeft;
        curtop += obj.offsetTop;
    } while (obj = obj.offsetParent);
    return {x: curleft, y: curtop};
};
module.exports = qc;

