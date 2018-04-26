// 圆盘的 SDF(带符号距离场)
function circleSDF(x, y, cx, cy, r) {
    let ux = x - cx;
    let uy = y - cy;
    return Math.sqrt(ux * ux + uy * uy) - r;
}

function segmentSDF(x, y, ax, ay, bx, by) {
    let vx = x - ax, vy = y - ay, ux = bx - ax, uy = by - ay;
    let t = Math.max(Math.min((vx * ux + vy * uy) / (ux * ux + uy * uy), 1.0), 0.0);
    let dx = vx - ux * t, dy = vy - uy * t;
    return Math.sqrt(dx * dx + dy * dy);
}

function capsuleSDF(x, y, ax, ay, bx, by, r) {
    return segmentSDF(x, y, ax, ay, bx, by) - r;
}

function planeSDF(x, y, px, py, nx, ny) {
    return (x - px) * nx + (y - py) * ny;
}

/**
 * 三角形
 * @param x {number} 0-1 范围内坐标
 * @param y {number} 0-1 范围内坐标
 * @param ax {number} A点x坐标
 * @param ay {number} A点y坐标
 * @param bx {number} B点x坐标
 * @param by {number} B点y坐标
 * @param cx {number} C点x坐标
 * @param cy {number} C点y坐标
 * @returns {number}
 */
function triangleSDF(x, y, ax, ay, bx, by, cx, cy) {
    let d = Math.min(Math.min(
        segmentSDF(x, y, ax, ay, bx, by),
        segmentSDF(x, y, bx, by, cx, cy)),
        segmentSDF(x, y, cx, cy, ax, ay));
    return (bx - ax) * (y - ay) > (by - ay) * (x - ax) &&
    (cx - bx) * (y - by) > (cy - by) * (x - bx) &&
    (ax - cx) * (y - cy) > (ay - cy) * (x - cx) ? -d : d;
}

// 矩形
function boxSDF(x, y, cx, cy, theta, sx, sy) {
    let costheta = Math.cos(theta);
    let sintheta = Math.sin(theta);
    let dx = Math.abs((x - cx) * costheta + (y - cy) * sintheta) - sx;
    let dy = Math.abs((y - cy) * costheta - (x - cx) * sintheta) - sy;
    let ax = Math.max(dx, 0.0);
    let ay = Math.max(dy, 0.0);
    return Math.min(Math.max(dx, dy), 0.0) + Math.sqrt(ax * ax + ay * ay);
}

////////////
// Operation
/////////////

/**
 * Union Operation on an array of objects
 * @param arr {[{sd, emissive}]}
 * @returns {{sd, emissive}}
 */
function unionOpArr(arr) {
    return arr.reduce((acc, cur) => unionOp(acc, cur));
}

/**
 * 并集
 * @param a {{sd, emissive}}
 * @param b {{sd, emissive}}
 * @returns {{sd, emissive}}
 */
function unionOp(a, b) {
    return a.sd < b.sd ? a : b;
}

/**
 * 交集
 * @param a {{sd, emissive}}
 * @param b {{sd, emissive}}
 * @returns {{sd, emissive}}
 */
function intersectOp(a, b) {
    let r = a.sd > b.sd ? b : a;
    r.sd = a.sd > b.sd ? a.sd : b.sd;
    return r;
}

/**
 * 减去
 * @param a {{sd, emissive}}
 * @param b {{sd, emissive}}
 * @returns {{sd, emissive}}
 */
function subtractOp(a, b) {
    let r = a;
    r.sd = (a.sd > -b.sd) ? a.sd : -b.sd;
    return r;
}

export {
    triangleSDF,
    boxSDF,
    circleSDF,
    segmentSDF,
    capsuleSDF,
    planeSDF,
    unionOp,
    unionOpArr,
    intersectOp,
    subtractOp
};
