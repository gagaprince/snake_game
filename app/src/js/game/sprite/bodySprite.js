var CircleSprite = require('./CircleSprite.js');
var BodySprite = qc.Sprite.extend({
    r:null,
    color1:null,
    color2:null,

    bottomCircle:null,
    topCircle:null,

    steps:[],
    isMove:false,
    dtime:0.001,

    init:function(r,color){
        this.color1 = color;
        this.r = r;
    },
    initWithType:function(r,typeObj){
        this.r = r;
        this.color1 = typeObj.color1;
        this.color2 = typeObj.color2;
        this.bottomCircle = CircleSprite.create(r,this.color1);
        this.topCircle = CircleSprite.create(r-4,this.color2);
        this.topCircle.setPosition(qc.p(1,0));
        this.addChild(this.bottomCircle);
        this.addChild(this.topCircle);
    },
    stepOn:function(pos,dtime){
        this.dtime = (dtime-10)/1000;
        this.steps.push(pos);
        this.startMove();
    },
    startMove:function(){
        if(!this.isMove){
            this.isMove = true;
            this.move();
        }
    },
    move:function(){
        var nextPos = this.steps.shift();
        //console.log(nextPos);
        //console.log("xia yi ge ")
        if(nextPos){
            var moveAction = qc.MoveTo.create(this.dtime,nextPos);
            var _this = this;
            var callFun = qc.CallFunc.create(function(){
                _this.move();
            },this);
            var actons = qc.Sequence.create([moveAction,callFun]);
            this.runAction(actons);
        }else{
            this.isMove = false;
        }
    }
});
var BodySpriteTypes=[
    {
        color1:"#ff00ff",
        color2:"#ff66ff"
    }
];
BodySprite.createByType=function(type){
    var r = 10;
    var typeObj = BodySpriteTypes[type];
    var sprite = new BodySprite();
    sprite.initWithType(r,typeObj);
    return sprite;
}
module.exports = BodySprite;