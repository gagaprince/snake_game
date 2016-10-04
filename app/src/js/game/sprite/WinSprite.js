var res = require('../resource.js').res;
var WinSprite = qc.Sprite.extend({
    openFrame:null,
    closeFrame:null,
    mySprite:null,
    isOpenFlag:null,
    init:function(openFlag){
        this.isOpenFlag = openFlag;
        this.initSprite(openFlag);
    },
    initSprite:function(openFlag){
        var frameCache = qc.SpriteFrameCache._getInstance();
        frameCache.addSpriteFrames(res.fishplist,res.fishes);
        this.openFrame = frameCache.getSpriteFrame("window-open.png");
        this.closeFrame = frameCache.getSpriteFrame("window-close.png");

        if(openFlag==0){
            this.mySprite = qc.Sprite.create(this.openFrame);
        }else{
            this.mySprite = qc.Sprite.create(this.closeFrame);
        }
        this.addChild(this.mySprite);
    },
    reflectFlag:function(){
        this.isOpenFlag = !this.isOpenFlag;
        if(this.isOpenFlag==0){
            this.mySprite.setSpriteFrame(this.openFrame);
        }else{
            this.mySprite.setSpriteFrame(this.closeFrame);
        }
    },
    isOpen:function(){
        return this.isOpenFlag==0;
    }
});
WinSprite.create = function(isOpen){
    var sprite = new WinSprite();
    sprite.init(isOpen);
    return sprite;
}
module.exports = WinSprite;