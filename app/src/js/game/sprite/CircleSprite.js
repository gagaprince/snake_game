var CircleSprite = qc.Sprite.extend({
    r:null,
    color:null,
    init:function(r,color){
        this.color = color;
        this.r = r;
    },
    draw:function(ctx){
        var _t = this;
        var context = ctx || qc._renderContext;
        var localTextureRect = _t._textureRect_Canvas;
        var anchorPoint = _t._anchorPoint;
        var anchorPointPoints = qc.p(anchorPoint.x*localTextureRect.width,anchorPoint.y*localTextureRect.height);
        //var drawRect = qc.rect(-anchorPointPoints.x,-localTextureRect.height+anchorPointPoints.y,localTextureRect.width,localTextureRect.height);
        ctx.save();
        ctx.fillStyle = _t.color||"#000";
        ctx.beginPath();
        ctx.arc(-anchorPointPoints.x,-localTextureRect.height+anchorPointPoints.y,_t.r,0,2*Math.PI);
        ctx.fill();
        ctx.restore();
    }
});
CircleSprite.create = function(r,color){
    var sprite = new CircleSprite();
    sprite.init(r,color);
    return sprite;
}
module.exports = CircleSprite;