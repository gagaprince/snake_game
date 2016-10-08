var BodysSprite = require('../sprite/BodysSprite.js');
var res = require('../resource.js').res;
var touchTemp={
    start:{},
    end:{}
};
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
        this.initListener();
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
        var touchLocation = touch.getLocation();
        touchTemp["start"]=touchLocation;
    },
    onTouchMoved:function(touch,event){
        var touchLocation = touch.getLocation();
        touch["end"]=touchLocation;
        var startTouch = touchTemp  ["start"];
        var disObj = this._giveMeDisObj(startTouch,touchLocation);
        if(disObj.dis>10){
            //计算角度
            var cos = disObj.disx/disObj.dis;
            var angle = -Math.acos(cos)/Math.PI*180;
            if(disObj.disy<0){
                angle = -angle;
            }
            this.bodysSprite.changeToAngle(angle);
        }
    },
    onTouchEnded:function(touch,event){
        touch["start"]=touch["end"]=null;
    },
    _giveMeDisObj:function(p1,p2){
        var sx = p1.x;
        var sy = p1.y;
        var ex = p2.x;
        var ey = p2.y;
        var disx = ex-sx;
        var disy = ey-sy;
        var dis = Math.sqrt(disx*disx+disy*disy);
        return {
            disx:disx,
            disy:disy,
            dis:dis
        };
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