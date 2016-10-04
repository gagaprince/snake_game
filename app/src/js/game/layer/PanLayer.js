var WinSprite = require('../sprite/WinSprite.js');
var res = require('../resource.js').res;
var PanLayer = qc.Layer.extend({
    bgSprite:null,
    frameCache:null,
    panWidth:0,
    panHeight:0,

    _beginX:0,
    _beginY:0,
    _winWidth:0,
    _winHeight:0,

    winSpriteMap:{},

    panArray:null,
    init:function(){
        this.initPanArray();
        this.initFrameCache();
        this.initBg();
        this.initWindow();
    },
    initFrameCache:function(){
        var frameCache = qc.SpriteFrameCache._getInstance();
        frameCache.addSpriteFrames(res.fishplist,res.fishes);
        this.frameCache = frameCache;
    },
    initBg:function(){
        var frameCache = this.frameCache;
        var frame = frameCache.getSpriteFrame("window-border.png");
        this.bgSprite = qc.Sprite.create(frame);
        var rect = this.bgSprite.getTextureRect();
        this.panWidth = rect.width;
        this.panHeight = rect.height;
        this.addChild(this.bgSprite);
    },
    initWindow:function(){
        this.initWindowBegin();
        for(var x=0;x<3;x++){
            for(var y=0;y<3;y++){
                var winSprite = WinSprite.create(this._findPanValue(x,y));
                this.addChild(winSprite);
                this.winSpriteMap[x+","+y]=winSprite;
                winSprite.setPosition(this._giveMePositionByXY(x,y));
            }
        }
    },
    initWindowBegin:function(){
        var width = this.panWidth/3;
        var height = this.panHeight/3;
        var beginX = -this.panWidth/2+width/2;
        var beginY = this.panHeight/2-height/2;
        this._beginX = beginX;
        this._beginY = beginY;
        this._winWidth = width;
        this._winHeight = height;
    },
    findWinSprite:function(x,y){
        return this.winSpriteMap[x+","+y];
    },
    _findPanValue:function(x,y){//第x行 第y列
        return this.panArray[x+3*y];
    },
    _giveMePositionByXY:function(x,y){
        return qc.p(this._beginX+x*this._winWidth,this._beginY-y*this._winHeight);
    },
    checkPan:function(position){
        var myPosition = this.getPosition();
        var scale = this.getScale();
        var relativeP = qc.p((position.x-myPosition.x)/scale,(position.y-myPosition.y)/scale);
        var x = parseInt((relativeP.x-(this._beginX-this._winWidth/2))/this._winWidth);
        var y = parseInt((this._beginY+this._winHeight/2-relativeP.y)/this._winHeight);
        if(x>2||y>2||x<0||y<0){
            return null;
        }
        return qc.p(x,y);
    },
    clickIndexP:function(indexP){
        var allP = this._findAllSideIndex(indexP);
        var allPItem = allP[0];
        for(var i=0;allPItem;allPItem = allP[++i]){
            var winSprite = this.findWinSprite(allPItem.x,allPItem.y);
            if(winSprite){
                winSprite.reflectFlag();
            }
        }
    },
    _findAllSideIndex:function(indexP){
        var allP = [];

        allP.push(qc.p(indexP.x-1,indexP.y));
        allP.push(qc.p(indexP.x,indexP.y-1));
        allP.push(qc.p(indexP.x+1,indexP.y));
        allP.push(qc.p(indexP.x,indexP.y+1));
        allP.push(indexP);

        return allP;

    },
    initPanArray:function(){
        this.panArray = [
            0,0,0,
            0,0,0,
            0,0,0
        ];
        for(var i=0;i<5;i++){
            var rx = Math.floor(Math.random()*3);
            var ry = Math.floor(Math.random()*3);
            this._relectPanValue(rx,ry);
            /*var allP = this._findAllSideIndex(qc.p(rx,ry));
            for(var j=0;j<allP.length;j++){
                var allPItem = allP[i];
                this._relectPanValue(allPItem.x,allPItem.y);
            }*/
        }
        console.log(this.panArray);
    },
    _relectPanValue:function(x,y){
        if(typeof this._findPanValue(x,y) !="undefined"){
            this.panArray[x+3*y]=!this.panArray[x+3*y];
        }
    }
});

PanLayer.create = function(){
    var layer = new PanLayer();
    layer.init();
    return layer;
}
module.exports = PanLayer;