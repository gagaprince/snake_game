var BodySprite = require('./bodySprite.js');
var CircleSprite = require('./CircleSprite.js');
var HeadSprite = qc.Sprite.extend({
    bodySprite:null,
    eyeSprite:null,
    layer:null,
    init:function(){
        this.layer = qc.Layer.create();
        this.addChild(this.layer);
    },
    initWithType:function(type){
        this.init();
        this.initBody(type);
        this.initEyes();
    },
    initEyes:function(){
        this.eyeSprite = CircleSprite.create(2,"#000");
        this.layer.addChild(this.eyeSprite);
        this.eyeSprite.setPosition(qc.p(4,0));
    },
    initBody:function(type){
        this.bodySprite = BodySprite.createByType(type);
        this.layer.addChild(this.bodySprite);
    }
});
HeadSprite.createByType=function(type){
    var sprite = new HeadSprite();
    sprite.initWithType(type);
    return sprite;
}

module.exports = HeadSprite;