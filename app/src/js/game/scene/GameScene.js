var BodysSprite = require('../sprite/BodysSprite.js');
var res = require('../resource.js').res;
var GameLayer = qc.Layer.extend({
    bgSprit:null,

    bodysSprite:null,

    winSize:null,

    midpos:null,

    init:function(){
        var winSize = this.winSize = qc.director.getWinSize();
        this.midpos = qc.p(winSize.width/2,winSize.height/2);
        this.initBg();
        this.initBody();
    },
    initBg:function(){
        var winSize = this.winSize;
        this.bgSprit = qc.Sprite.create(res.bg);
        this.addChild(this.bgSprit);
        this.bgSprit.setPosition(this.midpos);
        this.bgSprit.setScale(0.5);
    },
    initBody:function(){
        this.bodysSprite = BodysSprite.createByType(0);
        this.bodysSprite.setPosition(this.midpos);
        this.addChild(this.bodysSprite);
    },

    initListener:function(){
        var _t = this;
        qc.EventManager.addListener({
            event: qc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan.bind(_t),
            onTouchMoved: this.onTouchMoved.bind(_t),
            onTouchEnded: this.onTouchEnded.bind(_t)
        },this);
    },
    //如果需要阻止冒泡 则 使用stopPropagation
    onTouchBegan:function(touch,event){
        if(this.hasWin)return;
        var touchLocation = touch.getLocation();
        var panLayer = this.panLayer;
        var indexP = panLayer.checkPan(touchLocation);
        if(indexP!=null){
            this.clickNum ++;
            panLayer.clickIndexP(indexP);
        }
        this.checkGame();
    },
    onTouchMoved:function(touch,event){

    },
    onTouchEnded:function(touch,event){

    }
});
var GameScene = qc.Scene.extend({
    onEnter:function(){
        this._super();
        var gameLayer = new GameLayer();
        gameLayer.init();
        this.addChild(gameLayer);
    }
});

module.exports = GameScene;