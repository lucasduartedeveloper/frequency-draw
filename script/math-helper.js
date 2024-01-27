var _rotate2d = function(c, p, angle, deg=true) {
    var cx = c.x;
    var cy = c.y;
    var x = p.x;
    var y = p.y;
    var radians = deg ? (Math.PI / 180) * angle : angle,
    cos = Math.cos(parseFloat(radians.toFixed(2))),
    sin = Math.sin(parseFloat(radians.toFixed(2))),
    nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
    ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;
    return { x: nx, y: ny };
};

var _angle2d = function(co, ca) {
    var h = Math.sqrt(
    Math.abs(Math.pow(co, 2)) + 
    Math.abs(Math.pow(ca, 2)));

    var senA = co/h;
    var a = Math.asin(senA);
    a = co == 0 && ca > 0 ? 1.5707963267948966 * 2 : a;
    a = co > 0 && ca > 0 ? 1.5707963267948966 * 2 - a : a;
    a = co < 0 && ca > 0 ? 1.5707963267948966 * 2 - a : a;

    return isNaN(a) ? 0 : a;
};

Math.clip = function(value, max) {
    if (value > max) value = max;
    if (value < 0) value = 0;
    return value;
};

Math.normalize = function(v, max=1) {
    var openning = ((Math.abs(v.x)+Math.abs(v.y))/2)*2;
    openning = Math.clip(openning, max);
    var a = _angle2d(v.x, v.y);
    var c = { x: 0, y: 0 };
    var p = { x: 0, y: -openning };
    var n = _rotate2d(c, p, -a, false);
    return n;
};