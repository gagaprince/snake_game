qc.Label = qc.Sprite.extend({
    _selfString:"",
    _fontStyle:"黑体",
    _fontSize:20,
    _isUpdate:false,
    _fillColorStr:"rgba(0,0,0,255)",
    _displayedOpacity:255,
    ctor:function(str,fontstyle,fontsize){
        this._super();
        this._selfString = str;
        this._fontStyle = fontstyle||this._fontStyle;
        this._fontSize = fontsize||this._fontSize;
    },
    setString:function(str){
        this._selfString = str;
        this._isUpdate = true;
    },
    setFontSize:function(fontSize){
        this._fontSize = fontSize;
        this._isUpdate = true;
    },
    setColor:function(color){
        this._fillColorStr = "rgba("+color.r+","+color.g+","+color.b+","+this._displayedOpacity/255+")";
        this._isUpdate = true;
    },
    draw:function(ctx){
        if (!this._selfString || this._selfString == "")
            return;
//        if (this._isUpdate) {
//            this._isUpdate = false;
        this._updateTexture(ctx);
//        }
    },
    _updateTexture: function (ctx) {
        var locContext = ctx;
        ctx.save();
        if (this._selfString.length != 0) {
            ctx.font = this._fontSize+"px "+this._fontStyle;
            ctx.fillStyle = this._fillColorStr;
            ctx.fillText(this._selfString,0,0);
        }
        ctx.restore();
        return true;
    },
    setPosition:function(posx,posy){
        this._super(posx,posy);
        this._isUpdate = true;
    }
});
qc.Label.create = function(str,fontstyle,fontsize){
    return new qc.Label(str,fontstyle,fontsize);
}