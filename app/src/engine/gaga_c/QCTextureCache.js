var qc = require('./QCClass.js');
qc.textureCache = {
    _textures: {},
    textureForKey: function (textureKeyName) {
        return this._textures[textureKeyName];
    },
    getKeyByTexture: function (texture) {
        for (var key in this._textures) {
            if (this._textures[key] == texture) {
                return key;
            }
        }
        return null;
    },
    removeTexture: function (texture) {
        if (!texture)
            return;

        var locTextures = this._textures;
        for (var selKey in locTextures) {
            if (locTextures[selKey] == texture) {
                locTextures[selKey].releaseTexture();
                delete(locTextures[selKey]);
            }
        }
    },
    removeTextureForKey: function (textureKeyName) {
        if (textureKeyName == null)
            return;
        if (this._textures[textureKeyName])
            delete(this._textures[textureKeyName]);
    },
    cacheImage: function (path, texture) {
        if (texture instanceof  qc.Texture2D) {
            this._textures[path] = texture;
            return;
        }
        var texture2d = new qc.Texture2D();
        texture2d.initWithElement(texture);
        texture2d.handleLoadedTexture();
        this._textures[path] = texture2d;
    },
    addImage : function (url, cb, target) {

        var locTexs = this._textures;
        //remove judge
        var tex = locTexs[url];
        if (tex) {
            cb && cb.call(target);
            return tex;
        }

        tex = locTexs[url] = new qc.Texture2D();
        tex.url = url;
        if (!qc.loader.getRes(url)) {
            if (qc.loader._checkIsImageURL(url)) {
                qc.loader.load(url, function (err) {
                    cb && cb.call(target);
                });
            } else {
                qc.loader.cache[url] = qc.loader.loadImg(url, function (err, img) {
                    if (err)
                        return cb ? cb(err) : err;
                    qc.textureCache.handleLoadedTexture(url);
                    cb && cb(null, img);
                });
            }
        }
        else {
            tex.handleLoadedTexture();
        }

        return tex;
    },
    handleLoadedTexture:function(url){
        var locTexs = this._textures;
        //remove judge
        var tex = locTexs[url];
        if (!tex) {
            tex = locTexs[url] = new qc.Texture2D();
            tex.url = url;
        }
        tex.handleLoadedTexture();
    },
    _clear: function () {
        this._textures = {};
        this._textureColorsCache = {};
        this._textureKeySeq = (0 | Math.random() * 1000);
        this._loadedTexturesBefore = {};
    }
}

module.exports = qc;