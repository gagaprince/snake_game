var PanLayer = require('../layer/PanLayer.js');
var res = require('../resource.js').res;
var GameLayer = qc.Layer.extend({
    bgSprit:null,

    panLayer:null,

    winSize:null,

    hasWin:false,

    clickNum:0,

    init:function(){
        this.winSize = qc.director.getWinSize();
        this.initBg();
        this.initPan();
        this.initListener();
    },
    initBg:function(){
        var winSize = this.winSize;
        this.bgSprit = qc.Sprite.create(res.bg);
        this.addChild(this.bgSprit);
        this.bgSprit.setPosition(qc.p(winSize.width/2,winSize.height/2));
        this.bgSprit.setScale(0.5);
    },
    initPan:function(){
        var winSize = this.winSize;
        var panLay = PanLayer.create();
        this.addChild(panLay);
        panLay.setPosition(qc.p(winSize.width/2,winSize.height/2));
        panLay.setScale(0.5);
        this.panLayer = panLay;
    },
    checkGame:function(){
        var panLayer = this.panLayer;
        var isWin = true;
        for(var x=0;x<3;x++){
            for(var y=0;y<3;y++){
                var winSprite = panLayer.findWinSprite(x,y);
                if(!winSprite.isOpen()){
                    isWin = false;
                    break;
                }
            }
        }
        if(isWin){
            var _this = this;
            setTimeout(function(){
                alert("你赢了！你点击了"+_this.clickNum+"下");
            });
            this.hasWin = true;
        }
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