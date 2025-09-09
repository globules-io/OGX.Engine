OGX.Math = {};
OGX.Math.rotate = function(__vec, __ang){
    __ang = -__ang * (Math.PI/180);
    const cos = Math.cos(__ang);
    const sin = Math.sin(__ang);
    return [Math.round(10000*(__vec[0] * cos - __vec[1] * sin))/10000, Math.round(10000*(__vec[0] * sin + __vec[1] * cos))/10000];
};
OGX.Math.dist = function(__ptA, __ptB){
    return Math.sqrt((__ptA.x - __ptB.x) ** 2 + (__ptA.x - __ptB.y) ** 2);
};
OGX.Math.angle = function(__ptA, __ptB){
    function angle(__cx, __cy, __ex, __ey) {
        const dy = __ey - __cy;
        const dx = __ex - __cx;
        let theta = Math.atan2(dy, dx);
        theta *= 180 / Math.PI;
        return theta;
    }
    let theta = angle(__ptA.x, __ptA.y, __ptB.x, __ptB.y);
    theta < 0 ? theta = 360 + theta : null;
    return theta;
};