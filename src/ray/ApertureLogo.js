import {triangleSDF, circleSDF, intersectOp, unionOpArr, subtractOp, Result, unionOp} from "./SDF";

import {TWO_PI} from "./Consts";

const scale = 2;

const rRect = scale * 0.1;
// Radius of circlr
const rCirclr = scale * 0.18;
// Shrink
const dShrink = scale * 0.01;

function degreeToRad(deg) {
    return deg * TWO_PI / 360;
}

/**
 * 旋转
 * @param x
 * @param y
 * @param degree {{x, y}}
 */
function rotate(x, y, degree) {
    let rad = degreeToRad(degree);

    const cos = Math.cos(rad);
    const sin = Math.sin(rad);

    let xRet = x * cos + y * sin;
    let yRet = x * -sin + y * cos;

    return {
        x: xRet,
        y: yRet
    };
}

function triangleAtPos(num) {
    let ax = -3 / 2 * rRect;
    let ay = rRect;
    let bx = 1 / 2 * rRect;
    let by = rRect;
    let cx = -3 / 2 * rRect;
    let cy = 3 * rRect;

    let a = rotate(ax, ay, 45 * num);
    let b = rotate(bx, by, 45 * num);
    let c = rotate(cx, cy, 45 * num);

    return (x, y) => {
        return new Result(triangleSDF(x, y, a.x, a.y, b.x, b.y, c.x, c.y) + dShrink, 0, 0.9);
    };
}

/**
 * Return a scene
 * @param x {number}
 * @param y {number}
 * @returns {Result}
 * @constructor
 */
export default function ApertureLogoScene(x, y) {
    let arrTriangles = [];

    for (let i = 0; i < 8; i++) {
        arrTriangles.push(triangleAtPos(i)(x, y));
    }

    // 用于交集的圆
    const circleIntersct = new Result(circleSDF(x, y, 0, 0, rCirclr), 0, 0.9);

    // Light sources
    const lightSourceInner = new Result(circleSDF(x, y, 0, 0, rRect / 10), 5);
    const lightSourceOutter = subtractOp(
        new Result(circleSDF(x, y, 0, 0, 1), 5),
        new Result(circleSDF(x, y, 0, 0, 1 - 0.01), 5)
    );
    const lightSource = unionOp(lightSourceInner, lightSourceOutter);

    const apertureLogo = intersectOp(unionOpArr(arrTriangles), circleIntersct);

    return unionOp(apertureLogo, lightSource);
}