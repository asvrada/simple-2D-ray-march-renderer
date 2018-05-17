import {TWO_PI, MAX_DEPTH, BIAS} from "./Consts";
import {circleSDF, segmentSDF, capsuleSDF, boxSDF, unionOp, intersectOp, subtractOp, Result} from "./SDF";
import ApertureLogo from "./ApertureLogo";

export class App {
    constructor(canvasElement, config) {
        this.config = config;

        // Init canvas
        this.canvas = canvasElement;
        this.canvasCtx = this.canvas.getContext("2d");
        // Disable AA
        this.canvasCtx.imageSmoothingEnabled = false;

        this.canvasCtx.canvas.width = this.config.WIDTH;
        this.canvasCtx.canvas.height = this.config.HEIGHT;

        this.abort = false;
    }

    run(steps = 10) {
        // clear canvas
        this.canvasCtx.clearRect(0, 0, this.config.WIDTH, this.config.HEIGHT);

        const self = this;
        // Each row
        for (let startY = 0; startY < steps; startY += 1) {
            for (let y = startY; y < this.config.HEIGHT; y += steps) {

                // Each column
                for (let startX = 0; startX < steps; startX += 1) {
                    for (let x = startX; x < this.config.WIDTH; x += steps) {

                        const xLocal = (x / this.config.WIDTH) - 0.5;
                        const yLoacl = (1 - y / this.config.HEIGHT) - 0.5;

                        setTimeout(() => {
                            if (self.abort) {
                                return;
                            }

                            let greyScale = Math.floor(Math.min(self.sample(xLocal, yLoacl) * 255, 255));
                            self.draw(x, y, greyScale, greyScale, greyScale);
                        });
                    }
                }
            }
        }
    }

    draw(x, y, r, g, b) {
        this.canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        this.canvasCtx.fillRect(x, y, 1, 1);
    }

    // 蒙地卡罗积分
    sample(x, y) {
        let sum = 0.0;
        for (let i = 0; i < this.config.N; i++) {
            // let a = TWO_PI * Math.random();
            let a = TWO_PI * (i + (Math.random() - 0.5) * 2) / this.config.N;
            sum += this.trace(x, y, Math.cos(a), Math.sin(a), 0);
        }
        return sum / this.config.N;
    }

    /**
     * Scene
     * @param x {number}
     * @param y {number}
     * @returns {Result}
     */
    scene(x, y) {
        return ApertureLogo(x, y);

        // 5 折射场景
        // let light = new Result(circleSDF(x, y, -0.5, 0.5, 0.1), 5);
        // let rect = new Result(boxSDF(x, y, 0, 0, 1, 0.2, 0.2), 0, 0.2, 1.5);
        // return unionOp(light, rect);

        // 4 反射场景
        // let a = new Result(circleSDF(x, y, 0.1, 0.3, 0.1), 2.0, 0.0);
        // let b = new Result(circleSDF(x, y, 0, -0.25, 0.25), 0.0, 0.9);
        // let c = new Result(circleSDF(x, y, 0, -0.1, 0.2), 0.0, 0.9);
        // return unionOp(subtractOp(b, c), a);
    }

    // 光线步进
    trace(ox, oy, dx, dy, depth = 0) {
        let t = 1e-3;
        // 内/外？
        const sign = this.scene(ox, oy).sd > 0 ? 1 : -1;
        for (let i = 0; i < this.config.MAX_STEP && t < this.config.MAX_DISTANCE; i++) {
            const x = ox + dx * t;
            const y = oy + dy * t;
            let ret = this.scene(x, y);

            if ((ret.sd * sign) < this.config.EPSILON) {
                let sum = ret.emissive;

                if (depth < MAX_DEPTH && (ret.reflectivity > 0 || ret.eta > 0)) {
                    let refl = ret.reflectivity;

                    // 法线
                    let n = {x: null, y: null};
                    // 折射
                    let r = {x: null, y: null};

                    this.gradient(x, y, n);
                    n.x *= sign;
                    n.y *= sign;

                    if (ret.eta > 0) {
                        if (this.refract(dx, dy, n.x, n.y, sign < 0.0 ? ret.eta : 1.0 / ret.eta, r)) {
                            sum += (1.0 - refl) * this.trace(x - n.x * BIAS, y - n.y * BIAS, r.x, r.y, depth + 1);
                        } else {
                            // 全内反射
                            refl = 1;
                        }
                    }

                    if (refl > 0) {
                        this.reflect(dx, dy, n.x, n.y, r);
                        sum += refl * this.trace(x + n.x * BIAS, y + n.y * BIAS, r.x, r.y, depth + 1);
                    }
                }
                return sum;
            }

            t += ret.sd * sign;
        }

        return 0;
    }

    // 求反射法线
    reflect(ix, iy, nx, ny, r) {
        let idotn2 = (ix * nx + iy * ny) * 2.0;
        r.x = ix - idotn2 * nx;
        r.y = iy - idotn2 * ny;
    }

    // 求梯度
    gradient(x, y, n) {
        n.x = (this.scene(x + this.config.EPSILON, y).sd - this.scene(x - this.config.EPSILON, y).sd) * (0.5 / this.config.EPSILON);
        n.y = (this.scene(x, y + this.config.EPSILON).sd - this.scene(x, y - this.config.EPSILON).sd) * (0.5 / this.config.EPSILON);
    }

    // 求折射
    refract(ix, iy, nx, ny, eta, r) {
        let idotn = ix * nx + iy * ny;
        let k = 1.0 - eta * eta * (1.0 - idotn * idotn);
        if (k < 0) {
            // 全内反射
            return 0;
        }

        let a = eta * idotn + Math.sqrt(k);
        r.x = eta * ix - a * nx;
        r.y = eta * iy - a * ny;

        return 1;
    }
}
