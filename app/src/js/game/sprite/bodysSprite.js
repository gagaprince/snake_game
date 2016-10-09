var BodySprite = require('./bodySprite.js');
var HeadSprite = require('./headSprite.js');
var BodysSprite = qc.Sprite.extend({
    direction:null,
    moveDirection:null,
    step:10,
    bodyLayer:null,
    bodys:[],
    type:0,
    dtime:100,
    headRotateAction:null,
    init:function(type){
        this.type = type;
        this.bodyLayer = qc.Layer.create();
        this.addChild(this.bodyLayer);
        this.direction = Math.floor(Math.random()*360);
        this.moveDirection = this.direction-180;
        console.log(this.direction);
        console.log(this.moveDirection);
        this.initHead();
        this.initBodys();
        this.startMove();
    },
    initHead:function(){
        var bodys = this.bodys;
        var head = HeadSprite.createByType(this.type);
        head.setRotation(this.moveDirection);
        bodys.push(head);
    },
    initBodys:function(){
        var bodys = this.bodys;
        for(var i=1;i<50;i++){
            var lastBody = bodys[bodys.length-1];
            var body = BodySprite.createByType(this.type);
            var pos = this.cacularNextPos(lastBody&&lastBody.getPosition(),this.direction,this.step);
            body.setPosition(pos);
            bodys.push(body);
        }
        for(var i=bodys.length-1;i>=0;i--){
            this.bodyLayer.addChild(bodys[i]);
        }
    },
    cacularNextPos:function(pos,direction,step){
        var currentX = 0;
        var currentY = 0;
        if(pos){
            currentX = pos.x;
            currentY = pos.y;
        }
        var dir = direction/180*Math.PI;
        var newX = currentX+Math.cos(dir)*step;
        var newY = currentY-Math.sin(dir)*step;
        //console.log(newX,newY);
        return qc.p(newX,newY);
    },
    move:function(){
        var head = this.bodys[0];
        var nextPos = this.cacularNextPos(head.getPosition(),head.getRotation(),this.step);
        this.stepOn(nextPos);
    },
    stepOn:function(pos){
        var bodys = this.bodys;
        for(var i=0;i<bodys.length;i++){
            var tempBody = bodys[i];
            var tempPos = tempBody.getPosition();
            //tempBody.setPosition(pos);
            tempBody.stepOn(pos,this.dtime);
            pos = tempPos;
        }
    },
    /*_moveBodyToPos:function(body,pos){
        var bodyPos = body.getPosition();
        var disX = pos.x-bodyPos.x;
        var disY = pos.y-bodyPos.y;
        var dis = Math.sqrt(disX*disX+disY*disY);
        var newPos = qc.p((bodyPos.x+disX/dis),(bodyPos.y+disY/dis));
        body.setPosition(newPos);
    },*/
    startMove:function(){
        var _this = this;
        var myInterval = setInterval(function(){
            _this.move();
        },this.dtime);
    },
    changeToAngle:function(angle){
        var header = this.bodys[0];
        var direction = header.getRotation();
        console.log("dir:"+direction);
        var da = Math.abs(angle-direction);
        //console.log(da);
        //if(da>10&&da<350) {
        //    if(this.headRotateAction){
        //        //header.stopAction(this.headRotateAction);
        //    }
        //    var moveAction=this.headRotateAction = qc.RotateTo.create(0.1,angle);
            //header.runAction(moveAction);
            header.setRotation(angle);
        //}
    }

});
BodysSprite.createByType = function(type){
    var sprite = new BodysSprite();
    sprite.init(type);
    return sprite;
}

module.exports = BodysSprite;