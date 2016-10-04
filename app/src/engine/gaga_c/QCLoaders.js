var qc = require('./QCClass.js');
qc._txtLoader = {
    load : function(realUrl, url, res, cb){
        qc.loader.loadTxt(realUrl, cb);
    }
};
qc.loader.register(["txt", "xml", "vsh", "fsh", "atlas"], qc._txtLoader);

qc._jsonLoader = {
    load : function(realUrl, url, res, cb){
        qc.loader.loadJson(realUrl, cb);
    }
};
qc.loader.register(["json", "ExportJson"], qc._jsonLoader);

qc._imgLoader = {
    load : function(realUrl, url, res, cb){
        qc.loader.cache[url] =  qc.loader.loadImg(realUrl, function(err, img){
            if(err)
                return cb(err);
            qc.textureCache.handleLoadedTexture(url);
            cb(null, img);
        });
    }
};
qc.loader.register(["png", "jpg", "bmp","jpeg","gif", "ico"], qc._imgLoader);

qc._plistLoader = {
    load : function(realUrl, url, res, cb){
        qc.loader.loadTxt(realUrl, function(err, txt){
            if(err)
                return cb(err);
            cb(null, qc.plistParser.parse(txt));
        });
    }
};
qc.loader.register(["plist"], qc._plistLoader);
module.exports = qc;
