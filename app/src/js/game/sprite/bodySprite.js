var CircleSprite = require('./CircleSprite.js');
var BodySprite = qc.Sprite.extend({
    r:null,
    color1:null,
    color2:null,

    bottomCircle:null,
    topCircle:null,

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