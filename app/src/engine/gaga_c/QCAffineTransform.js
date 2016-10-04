/****************************************************************************
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011-2012 cocos2d-x.org
 Copyright (c) 2013-2014 Chukong Technologies Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

var qc = require('./QCClass.js');

/**
 * @function
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} tx
 * @param {Number} ty
 */
qc.AffineTransform = function (a, b, c, d, tx, ty) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
};

/**
 * 
 * @function
 * @param {Number} a
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 * @param {Number} tx
 * @param {Number} ty
 * @return {qc.AffineTransform}
 * Constructor
 */
qc.AffineTransformMake = function (a, b, c, d, tx, ty) {
    return {a: a, b: b, c: c, d: d, tx: tx, ty: ty};
};

/**
 * 
 * @function
 * @param {qc.Point} point
 * @param {qc.AffineTransform} t
 * @return {qc.Point}
 * Constructor
 */
qc.PointApplyAffineTransform = function (point, t) {
    return {x: t.a * point.x + t.c * point.y + t.tx, y: t.b * point.x + t.d * point.y + t.ty};
};

qc._PointApplyAffineTransform = function (x, y, t) {
    return {x: t.a * x + t.c * y + t.tx,
        y: t.b * x + t.d * y + t.ty};
};

/**
 * 
 * @function
 * @param {qc.Size} size
 * @param {qc.AffineTransform} t
 * @return {qc.Size}
 * Constructor
 */
qc.SizeApplyAffineTransform = function (size, t) {
    return {width: t.a * size.width + t.c * size.height, height: t.b * size.width + t.d * size.height};
};

/**
 * 
 * @function
 * @return {qc.AffineTransform}
 * Constructor
 */
qc.AffineTransformMakeIdentity = function () {
    return {a: 1.0, b: 0.0, c: 0.0, d: 1.0, tx: 0.0, ty: 0.0};
};

/**
 * 
 * @function
 * @return {qc.AffineTransform}
 * Constructor
 */
qc.AffineTransformIdentity = function () {
    return {a: 1.0, b: 0.0, c: 0.0, d: 1.0, tx: 0.0, ty: 0.0};
};

/**
 * 
 * @function
 * @param {qc.Rect} rect
 * @param {qc.AffineTransform} anAffineTransform
 * @return {qc.Rect}
 * Constructor
 */
qc.RectApplyAffineTransform = function (rect, anAffineTransform) {
    var top = qc.rectGetMinY(rect);
    var left = qc.rectGetMinX(rect);
    var right = qc.rectGetMaxX(rect);
    var bottom = qc.rectGetMaxY(rect);

    var topLeft = qc._PointApplyAffineTransform(left, top, anAffineTransform);
    var topRight = qc._PointApplyAffineTransform(right, top, anAffineTransform);
    var bottomLeft = qc._PointApplyAffineTransform(left, bottom, anAffineTransform);
    var bottomRight = qc._PointApplyAffineTransform(right, bottom, anAffineTransform);

    var minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
    var maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);

    return qc.rect(minX, minY, (maxX - minX), (maxY - minY));
};

qc._RectApplyAffineTransformIn = function(rect, anAffineTransform){
    var top = qc.rectGetMinY(rect);
    var left = qc.rectGetMinX(rect);
    var right = qc.rectGetMaxX(rect);
    var bottom = qc.rectGetMaxY(rect);

    var topLeft = qc._PointApplyAffineTransform(left, top, anAffineTransform);
    var topRight = qc._PointApplyAffineTransform(right, top, anAffineTransform);
    var bottomLeft = qc._PointApplyAffineTransform(left, bottom, anAffineTransform);
    var bottomRight = qc._PointApplyAffineTransform(right, bottom, anAffineTransform);

    var minX = Math.min(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var maxX = Math.max(topLeft.x, topRight.x, bottomLeft.x, bottomRight.x);
    var minY = Math.min(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);
    var maxY = Math.max(topLeft.y, topRight.y, bottomLeft.y, bottomRight.y);

    rect.x = minX;
    rect.y = minY;
    rect.width = maxX - minX;
    rect.height = maxY - minY;
    return rect;
};

/**
 * 
 * @function
 * @param {qc.AffineTransform} t
 * @param {Number} tx
 * @param {Number}ty
 * @return {qc.AffineTransform}
 * Constructor
 */
qc.AffineTransformTranslate = function (t, tx, ty) {
    return {
        a: t.a,
        b: t.b,
        c: t.c,
        d: t.d,
        tx: t.tx + t.a * tx + t.c * ty,
        ty: t.ty + t.b * tx + t.d * ty
    };
};

/**
 * 
 * @function
 * @param {qc.AffineTransform} t
 * @param {Number} sx
 * @param {Number} sy
 * @return {qc.AffineTransform}
 * Constructor
 */
qc.AffineTransformScale = function (t, sx, sy) {
    return {a: t.a * sx, b: t.b * sx, c: t.c * sy, d: t.d * sy, tx: t.tx, ty: t.ty};
};

/**
 * 
 * @function
 * @param {qc.AffineTransform} aTransform
 * @param {Number} anAngle
 * @return {qc.AffineTransform}
 * Constructor
 */
qc.AffineTransformRotate = function (aTransform, anAngle) {
    var fSin = Math.sin(anAngle);
    var fCos = Math.cos(anAngle);

    return {a: aTransform.a * fCos + aTransform.c * fSin,
        b: aTransform.b * fCos + aTransform.d * fSin,
        c: aTransform.c * fCos - aTransform.a * fSin,
        d: aTransform.d * fCos - aTransform.b * fSin,
        tx: aTransform.tx,
        ty: aTransform.ty};
};

/**
 * Concatenate `t2' to `t1' and return the result:<br/>
 * t' = t1 * t2
 * 
 * @function
 * @param {qc.AffineTransform} t1
 * @param {qc.AffineTransform} t2
 * @return {qc.AffineTransform}
 * Constructor
 */
qc.AffineTransformConcat = function (t1, t2) {
    return {a: t1.a * t2.a + t1.b * t2.c,                          //a
        b: t1.a * t2.b + t1.b * t2.d,                               //b
        c: t1.c * t2.a + t1.d * t2.c,                               //c
        d: t1.c * t2.b + t1.d * t2.d,                               //d
        tx: t1.tx * t2.a + t1.ty * t2.c + t2.tx,                    //tx
        ty: t1.tx * t2.b + t1.ty * t2.d + t2.ty};				    //ty
};

/**
 * Return true if `t1' and `t2' are equal, false otherwise.
 * 
 * @function
 * @param {qc.AffineTransform} t1
 * @param {qc.AffineTransform} t2
 * @return {Boolean}
 * Constructor
 */
qc.AffineTransformEqualToTransform = function (t1, t2) {
    return ((t1.a === t2.a) && (t1.b === t2.b) && (t1.c === t2.c) && (t1.d === t2.d) && (t1.tx === t2.tx) && (t1.ty === t2.ty));
};

/**
 * Get the invert value of an AffineTransform object
 * 
 * @function
 * @param {qc.AffineTransform} t
 * @return {qc.AffineTransform}
 * Constructor
 */
qc.AffineTransformInvert = function (t) {
    var determinant = 1 / (t.a * t.d - t.b * t.c);
    return {a: determinant * t.d, b: -determinant * t.b, c: -determinant * t.c, d: determinant * t.a,
        tx: determinant * (t.c * t.ty - t.d * t.tx), ty: determinant * (t.b * t.tx - t.a * t.ty)};
};

module.exports = qc;