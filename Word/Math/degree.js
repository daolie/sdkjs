function CDegree()
{
    this.kind = MATH_DEGREE;

    this.type = DEGREE_SUPERSCRIPT ;
    this.upper = 0;
    this.alnScr = false;  // не выровнены, итераторы идут в соответствии с наклоном буквы/мат. объекта

    CMathBase.call(this);
}
extend(CDegree, CMathBase);
CDegree.prototype.init = function(props)
{
    if(props.alnScr === true || props.alnScr === 1)
        this.alnScr = true;
    else if(props.alnScr === false || props.alnScr === 0)
        this.alnScr = false;

    this.init_2( props, new CMathContent() );
}
CDegree.prototype.init_2 = function(props, oBase)
{
    if(props.type === DEGREE_SUPERSCRIPT)
        this.type = DEGREE_SUPERSCRIPT;
    else if(props.type === DEGREE_SUBSCRIPT)
        this.type = DEGREE_SUBSCRIPT;

    this.setDimension(1, 2);

    var oDegree = new CMathContent();
    oDegree.setReduct(DEGR_REDUCT);

    this.addMCToContent(oBase, oDegree);
}
CDegree.prototype.recalculateSize = function(oMeasure)
{
    if(this.type === DEGREE_SUPERSCRIPT)
        this.recalculateSup(oMeasure);
    else if(this.type === DEGREE_SUBSCRIPT)
        this.recalculateSubScript(oMeasure);
}
CDegree.prototype.recalculateSup = function(oMeasure)
{
    var base = this.elements[0][0].size,
        iter   = this.elements[0][1].size;

    var width = base.width + iter.width;

    var height = 0,
        ascent = 0;

    var descIter = iter.height - iter.ascent;

    var ctrPrp = this.getCtrPrp(); // выставить потом размер шрифта для итератора
    var shCenter = this.getShiftCenter(oMeasure, ctrPrp);

    var upper = 0;

    if(descIter + shCenter > 2/3*base.height)
    {
        upper = iter.height - 2/3*base.height;
    }
    else
    {
        upper = iter.ascent - shCenter;
    }

    this.upper = upper;

    if(upper > 0)
    {
        height = this.upper + base.height;
        ascent = this.upper + base.ascent;
    }
    else
    {
        height = base.height;
        ascent = base.ascent;
    }

    this.size = {width: width, height: height, ascent: ascent};
}
CDegree.prototype.recalculateSubScript = function(oMeasure)
{
    var base = this.elements[0][0].size,
        iter   = this.elements[0][1].size;

    var width = base.width + iter.width;
    var height = 0,
        ascent = 0;

    /*var FontSize = this.getCtrPrp().FontSize,
        shiftCenter = 0.5*DIV_CENT*FontSize;*/

    var ctrPrp = this.getCtrPrp(); // выставить потом размер шрифта для итератора
    var shCenter = this.getShiftCenter(oMeasure, ctrPrp);
    var low = 0;

    if(iter.ascent - shCenter > 2/3*base.height)
    {
        low = iter.height - 2/3*base.height;
    }
    else
    {
        low = iter.height - iter.ascent + shCenter;
    }

    height = base.height + low;
    ascent = base.ascent;

    this.upper = -(height - iter.height);

    this.size = {width: width, height: height, ascent: ascent};

}
CDegree.prototype.old_setPosition = function(_pos)
{
    var pos = _pos;
    if(this.bMObjs === true)
    {
        pos = {x: pos.x, y: pos.y + this.size.center };
    }

    this.elements[0][0].setPosition({x: pos.x, y: pos.y - this.elements[0][0].size.center });
    this.elements[0][1].setPosition({x: pos.x + this.elements[0][0].size.width + this.dW, y: pos.y + this.shiftDegree - this.size.center});
}
CDegree.prototype.setPosition = function(pos)
{
    if(this.bMObjs === true)
        this.pos = pos;
    else
        this.pos = {x: pos.x, y: pos.y - this.size.ascent};

    var shBase = 0,
        shIter = 0;

    if(this.upper > 0)
        shBase = this.upper;
    else
        shIter = - this.upper;

    this.elements[0][0].setPosition({x: this.pos.x, y: this.pos.y + shBase});
    this.elements[0][1].setPosition({x: this.pos.x + this.elements[0][0].size.width + this.dW, y: this.pos.y + shIter});
}
CDegree.prototype.findDisposition = function(mCoord)
{
    var coordX, coordY;
    var X, Y;

    var inside_flag = -1;

    var shBase = 0,
        shIter = 0;

    if(this.upper > 0)
        shBase = this.upper;
    else
        shIter = - this.upper;

    if( mCoord.x < this.elements[0][0].size.width)
    {
        if( this.elements[0][0].IsJustDraw() )
        {
            X = 0; Y = 1; // встаем во второй элемент
            coordX = 0;
            coordY = mCoord.y - shIter;

            inside_flag = 0;
        }
        else
        {
            X = 0; Y = 0; // встаем в первый элемент
            coordX =  mCoord.x;
            coordY =  mCoord.y - shBase;
        }
    }
    else if(mCoord.x < (this.elements[0][0].size.width + this.dW ))
    {
        X = 0; Y = 1; // встаем во второй элемент
        coordX = 0;
        coordY = mCoord.y - shIter;
        inside_flag = 0;
    }
    else if(mCoord.x > this.size.width)
    {
        X = 0; Y = 1; // встаем во второй элемент
        coordX = this.size.width;
        coordY = mCoord.y - shIter;
        inside_flag = 1;
    }
    else
    {
        X = 0; Y = 1; // встаем во второй элемент
        coordX = mCoord.x - (this.elements[0][0].size.width + this.dW);
        coordY = mCoord.y - shIter;
    }

    if(coordY < 0)
    {
        coordY = 0;
        inside_flag = 2;
    }
    else if(coordY > this.elements[X][Y].size.height)
    {
        coordY = this.elements[X][Y].size.height;
        inside_flag = 2;
    }

    var mCoord = {x: coordX, y: coordY};

    return {pos: {x: X, y: Y}, mCoord: mCoord, inside_flag: inside_flag};
}
CDegree.prototype.old_findDisposition = function(mCoord)
{
    var coordX, coordY;
    var X, Y;

    var inside_flag = -1;

    if( mCoord.x < this.elements[0][0].size.width)
    {
        if( this.elements[0][0].IsJustDraw() )
        {
            X = 0; Y = 1; // встаем во второй элемент
            coordX = 0;
            coordY = mCoord.y - this.shiftDegree;
            inside_flag = 0;
        }
        else
        {
            X = 0; Y = 0; // встаем в первый элемент
            coordX = mCoord.x;
            coordY =  mCoord.y - ( this.size.center - this.elements[0][0].size.center);
        }
    }
    else if(mCoord.x < (this.elements[0][0].size.width + this.dW ))
    {
        X = 0; Y = 1; // встаем во второй элемент
        coordX = 0;
        coordY = mCoord.y - this.shiftDegree;
        inside_flag = 0;
    }
    else if(mCoord.x > this.size.width)
    {
        X = 0; Y = 1; // встаем во второй элемент
        coordX = this.size.width;
        coordY = mCoord.y - this.shiftDegree;
        inside_flag = 1;
    }
    else
    {
        X = 0; Y = 1; // встаем во второй элемент
        coordX = mCoord.x - (this.elements[0][0].size.width + this.dW);
        coordY = mCoord.y - this.shiftDegree;
    }

    if(coordY < 0)
    {
        coordY = 0;
        inside_flag = 2;
    }
    else if(coordY > this.elements[X][Y].size.height)
    {
        coordY = this.elements[X][Y].size.height;
        inside_flag = 2;
    }

    var mCoord = {x: coordX, y: coordY};

    return {pos: {x: X, y: Y}, mCoord: mCoord, inside_flag: inside_flag};
}
CDegree.prototype.getIterator = function()
{
    return this.elements[0][1];
}
CDegree.prototype.getUpperIterator = function()
{
    return this.elements[0][1];
}
CDegree.prototype.getLowerIterator = function()
{
    return this.elements[0][1];
}
CDegree.prototype.getBase = function()
{
    return this.elements[0][0];
}
CDegree.prototype.getPropsForWrite = function()
{
    var props = {};
    props.type = this.type;
    props.alnScr = this.alnScr;

    return props;
}

function CIterators()
{
    this.upper = 0;
    CMathBase.call(this);
}
extend(CIterators, CMathBase);
CIterators.prototype.init = function()
{
    this.setDimension(2, 1);
    this.setContent();
}
CIterators.prototype.setDistanceIters = function(oMeasure)
{
    /*var descF = this.elements[0][0].size.height - this.elements[0][0].size.center ,
        ascS = this.elements[1][0].size.center;*/

    var upIter  = this.elements[0][0].size,
        lowIter = this.elements[1][0].size;

    /*var FontSize = this.getCtrPrp().FontSize,
        shCent = DIV_CENT*FontSize;*/

    var ctrPrp = this.getCtrPrp();
    var shCenter = this.getShiftCenter(oMeasure, ctrPrp);

    var upDesc = upIter.height - upIter.ascent + shCenter,
        lowAsc = lowIter.ascent - shCenter;

    var up = 0;
    var down = 0;
    if(this.lUp  > upDesc)
    {
        up = this.lUp - upDesc;
        this.upper = upIter.height - upDesc;
    }
    else
    {
        up = 0;
        this.upper = upIter.height - this.lUp;
    }


    if( this.lD > lowAsc )
        down = this.lD - lowAsc;

    this.dH = up + down;
    this.dW = 0;
}
/*CIterators.prototype.getAscent = function()
{
    var ascent = 0;
    var upIter  = this.elements[0][0].size;

    *//*var FontSize = this.getCtrPrp().FontSize,
        shCent = DIV_CENT*FontSize;*//*

    var shCenter = this.getShiftCenter();

    var upDesc = upIter.height - upIter.ascent + shCent;

    if(this.lUp > upDesc)
        ascent = upIter.height - upDesc + this.lUp;
    else
        ascent = upIter.height + shCent;

    return ascent;
}*/
CIterators.prototype.getUpperIterator = function()
{
    return this.elements[0][0];
}
CIterators.prototype.getLowerIterator = function()
{
    return this.elements[1][0];
}
CIterators.prototype.setReduct = function(reduct)
{
    this.elements[0][0].setReduct(reduct);
    this.elements[1][0].setReduct(reduct);
}
CIterators.prototype.getCtrPrp = function()
{
    return this.Parent.getCtrPrp();
}

function CDegreeSubSup()
{
    this.kind = MATH_DEGREESubSup;

    this.type = DEGREE_SubSup;
    this.alnScr = false;    // не выровнены, итераторы идут в соответствии с наклоном буквы/мат. объекта
    CSubMathBase.call(this);
}
extend(CDegreeSubSup, CSubMathBase);
CDegreeSubSup.prototype.init = function(props)
{
    if(props.alnScr === true || props.alnScr === 1)
        this.alnScr = true;
    else if(props.alnScr === false || props.alnScr === 0)
        this.alnScr = false;

    var oBase = new CMathContent();
    this.init_2(props, oBase);
}
CDegreeSubSup.prototype.init_2 = function(props, oBase)
{
    /*if( typeof(props.type)!=="undefined"|| props.type !== null)
        this.type = props.type;*/

    if(props.type === DEGREE_SubSup)
        this.type = DEGREE_SubSup;
    else if(props.type === DEGREE_PreSubSup)
        this.type = DEGREE_PreSubSup;

    this.setDimension(1, 2);

    var oIters = new CIterators();
    oIters.init();
    oIters.setReduct(DEGR_REDUCT);

    oIters.lUp = 0;
    oIters.lD = 0;

    if(this.type == DEGREE_SubSup)
    {
        oIters.alignHor(-1, 0);
        this.addMCToContent(oBase, oIters);
    }
    else if(this.type == DEGREE_PreSubSup)
    {
        oIters.alignHor(-1, 1);
        this.addMCToContent(oIters, oBase);
    }

}
CDegreeSubSup.prototype.recalculateSize = function(oMeasure)
{
    var ctrPrp = this.getCtrPrp();
    var shCenter = this.getShiftCenter(oMeasure, ctrPrp);

    var width = 0, height = 0,
        ascent = 0;

    var iters, base;

    if(this.type == DEGREE_SubSup)
    {
        iters = this.elements[0][1];
        base  = this.elements[0][0];

    }
    else if(this.type == DEGREE_PreSubSup)
    {
        iters = this.elements[0][0];
        base  = this.elements[0][1];

        /*this.elements[0][0].lUp = this.elements[0][1].size.center;
        this.elements[0][0].lD = this.elements[0][1].size.height - this.elements[0][1].size.center;
        this.elements[0][0].setDistance();
        this.elements[0][0].recalculateSize();*/
    }

    iters.lUp = base.size.ascent - shCenter;
    iters.lD  = base.size.height - iters.lUp;
    iters.setDistanceIters(oMeasure);
    iters.recalculateSize();

    width  = iters.size.width + base.size.width;
    //height = shCenter + iters.lUp;
    height = iters.size.height;

    ascent = iters.upper + base.size.ascent;

    this.size = {width: width, height: height, ascent: ascent};

    //CSubMathBase.superclass.recalculateSize.call(this);
}
CDegreeSubSup.prototype.old_setPosition = function(pos)
{
    this.pos = {x: pos.x, y: pos.y - this.size.ascent};

    if(this.type == DEGREE_SubSup)
    {
        var iters = this.elements[0][1],
            base  = this.elements[0][0];

        var posBase  = {x: this.pos.x, y: this.pos.y + iters.upper},
            posIters = {x: this.pos.x + base.size.width, y: this.pos.y};
        base.setPosition(posBase);
        iters.setPosition(posIters);
    }

}
CDegreeSubSup.prototype.align = function(x, y)
{
    var _x = 0, _y = 0;

    if(this.type == DEGREE_SubSup)
    {
        if(x == 0 && y == 0)
            _y = this.elements[0][1].upper;
    }
    else
    {
        if(x == 0 && y == 1)
            _y = this.elements[0][0].upper;
    }

    return {x: _x, y: _y};
}
CDegreeSubSup.prototype.getBase = function()
{
    var base;

    if(this.type == DEGREE_SubSup)
        base = this.elements[0][0];
    else if(this.type == DEGREE_PreSubSup)
        base = this.elements[0][1];

    return base;
}
CDegreeSubSup.prototype.getUpperIterator = function()
{
    var iter;

    if(this.type == DEGREE_SubSup)
        iter = this.elements[0][1].getUpperIterator();
    else if(this.type == DEGREE_PreSubSup)
        iter = this.elements[0][0].getUpperIterator();

    return iter;
}
CDegreeSubSup.prototype.getLowerIterator = function()
{
    var iter;

    if(this.type == DEGREE_SubSup)
        iter = this.elements[0][1].getLowerIterator();
    else if(this.type == DEGREE_PreSubSup)
        iter = this.elements[0][0].getLowerIterator();

    return iter;
}
CDegreeSubSup.prototype.getPropsForWrite = function()
{
    var props = {};

    props.type = this.type;
    props.alnScr = this.alnScr;

    return props;
}

//выяcнить: почему и с этой ф-ией и без нее работает всё ok...
//всё ok, т.к. в контенте 2 элемента, и их center сравниваем
/*CDegreeSubSup.prototype.getCenter = function()
{
    var center = 0;
    if(this.type == 0)
        center = this.elements[0][1].size.center;
    else
        center = this.elements[0][0].size.center;

    return center;
}*/
