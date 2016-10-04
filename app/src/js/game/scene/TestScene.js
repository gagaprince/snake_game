var TestLayer = qc.Layer.extend({
    mysprite:null,
    isSelect:false,
    init:function(){
        this._super();
        this.setPosition(0,0);
        var s = qc.Sprite.create(res.daojuimg,qc.rect(0,0,64,86));
        this.addChild(s);
        var winSize = qc.director.getWinSize();
        s.setPosition(qc.p(winSize.width/2,winSize.height/2));
        s.setRotation(90);
        //s.setScale(2);
        s.setAnchorPoint(qc.p(0.5,0.5));
        //var moveAction = qc.MoveTo.create(2,qc.p(50,50));
        var rotateAction = qc.RotateTo.create(1,360);
        var call = qc.CallFunc.create(function(){
            s.setRotation(0);
        });
        var sqAction = qc.Sequence.create([rotateAction,call]);
        var repeat = qc.RepeatForever.create(sqAction,4);
        s.runAction(repeat);
//        var ss = qc.Sprite.create(res.daojuimg,qc.rect(0,0,64,43));
//        this.addChild(ss);
//        var actionTo = qc.MoveTo.create(0.5,qc.p(240,320));
//        var actionTo2 = qc.MoveTo.create(0.5,qc.p(winSize.width/2,winSize.height/2));
//        var actionRotate = qc.RotateTo.create(1,360);
//        var callFun = qc.CallFunc.create(function(){
//            s.setRotation(0);
//        },this);
//        var scaleTo2 = qc.ScaleTo.create(0.5,2);
//        var scaleTo1 = qc.ScaleTo.create(0.5,1);
//        var allAction = qc.Sequence.create([actionTo,actionTo2,actionRotate,callFun,scaleTo2,scaleTo1]);
//        var repeatAction = qc.RepeatForever.create(allAction);
//        s.runAction(repeatAction);
//        setTimeout(function(){
//            s.stopAllActions();
//            s.setLocalZOrder(100);
//        },2000)
//        ss.setPosition(qc.p(winSize.width/2,winSize.height/2))
//        this.mysprite = ss;
//        this.addListener();
//
        var frameCache = qc.SpriteFrameCache._getInstance();
        frameCache.addSpriteFrames(res.daoju_plist,res.daojuimg);
        var frame = frameCache.getSpriteFrame("game_skill_k.png");
        var tempSprite = qc.Sprite.create(frame);
        tempSprite.setPosition(qc.p(30,30));
        var frames = [];
        frames.push(frame);
        frames.push(frameCache.getSpriteFrame("game_skill_0.png"));
        frames.push(frameCache.getSpriteFrame("game_skill_1.png"));
        var animation = qc.Animation.create(frames,0.1);
        var animate = qc.Animate.create(animation);
        tempSprite.runAction(animate);
        this.addChild(tempSprite);
////        setTimeout(function(){
////            tempSprite.stopAllActions();
////            tempSprite.removeFromParent();
////        },2000);
//        this.addChild(tempSprite);
//        var label = qc.Label.create("我是",null,40);
//        label.setPosition(qc.p(180,180));
//        label.setColor(qc.color(0,255,0));
//        this.addChild(label);
    },
    addListener:function(){
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
        qc.log(touchLocation);
        var rect = this.mysprite.getDrawRect();
        var position = this.mysprite.getPosition();
        var left = position.x+rect.x;
        var right = left+rect.width;
        var bottom = position.y+rect.y;
        var top = bottom+rect.height;
        if(touchLocation.x>left&&touchLocation.x<right&&touchLocation.y>bottom&&touchLocation.y<top){
            this.isSelect = true;
        }
    },
    onTouchMoved:function(touch,event){
        if(!this.isSelect)return;
        var touchLocation = touch.getLocation();
        qc.log(touchLocation);
        this.mysprite.setPosition(touchLocation)
    },
    onTouchEnded:function(touch,event){
        this.isSelect = false;
    }
});
var MyScene = qc.Scene.extend({
    onEnter:function(){
        this._super();
        var gameLayer = new TestLayer();
        gameLayer.init();
        this.addChild(gameLayer);
    }
});