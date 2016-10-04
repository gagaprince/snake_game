var AI = AI||{};
AI.resolve = function(cArray){
    var rect33 = [
        [1,1,0,1,0,0,0,0,0],
        [1,1,1,0,1,0,0,0,0],
        [0,1,1,0,0,1,0,0,0],
        [1,0,0,1,1,0,1,0,0],
        [0,1,0,1,1,1,0,1,0],
        [0,0,1,0,1,1,0,0,1],
        [0,0,0,1,0,0,1,1,0],
        [0,0,0,0,1,0,1,1,1],
        [0,0,0,0,0,1,0,1,1],
    ];

    function resolveRect(rect,cArray){
        var length = rect.length;
        for(var i=0;i<length;i++){
            for(var j=i+1;j<length;j++){
                var r1 = rect[i];
                var r2 = rect[j];
                if(r2[i]==1){
                    if(r1[i]==1){//销元
                        addRect(r1,r2);
                        var c1 = cArray[i];
                        var c2 = cArray[j];
                        cArray[j] = addRect(c1,c2);
                    }else{//交换
                        var temp = rect[i];
                        rect[i]=rect[j];
                        rect[j]=temp;
                        temp = cArray[i];
                        cArray[i]=cArray[j];
                        cArray[j]=temp;
                    }
                }
            }

            if(rect[i][i]!=1){
                throw "无解！！";
                return;
            }else{
                for(var j=0;j<i;j++){
                    var r1 = rect[i];
                    var r2 = rect[j];
                    if(r2[i]==1){
                        addRect(r1,r2);
                        var c1 = cArray[i];
                        var c2 = cArray[j];
                        cArray[j] = addRect(c1,c2);
                    }
                }
            }
        }
    }

    function addRect(r1,r2){
        if(typeof r2 == "number")return r2^r1;
        var len = r2.length;
        for(var i=0;i<len;i++){
            r2[i]=r2[i]^r1[i];
        }
    }

    resolveRect(rect33,cArray);

    console.log(rect33);
    console.log(cArray);

}
window.AI=AI;
module.exports = AI;