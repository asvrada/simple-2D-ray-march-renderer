import {TWO_PI} from "./Consts";
// import {circleSDF, segmentSDF, capsuleSDF, planeSDF, unionOp, intersectOp, subtractOp} from "./SDF";
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
            sum += this.trace(x, y, Math.cos(a), Math.sin(a));
        }
        return sum / this.config.N;
    }

    /**
     * Scene
     * @param x {number}
     * @param y {number}
     * @returns {{sd: number, emissive: number}}
     */
    scene(x, y) {
        // return {sd: circleSDF(x, y, 0, 0, 0.10), emissive: 2};

        return ApertureLogo(x, y);
        // let c = {sd: capsuleSDF(x, y, 0.4, 0.4, 0.6, 0.6, 0.1), emissive: 1};
        // return c;

        // let a = {sd: circleSDF(x, y, 0.4, 0.5, 0.2), emissive: 1};
        // let b = {sd: circleSDF(x, y, 0.6, 0.5, 0.2), emissive: 0.8};

        // return unionOp(a, b);
        // return intersectOp(a, b);
        // return subtractOp(a, b);
        // return subtractOp(b, a);

        // let r1 = {sd: circleSDF(x, y, 0.3, 0.3, 0.10), emissive: 2};
        // let r2 = {sd: circleSDF(x, y, 0.3, 0.7, 0.05), emissive: 0.8};
        // let r3 = {sd: circleSDF(x, y, 0.7, 0.5, 0.10), emissive: 0};
        //
        // return unionOp(unionOp(r1, r2), r3);
    }

    // 光线步进
    trace(ox, oy, dx, dy) {
        let t = 0;
        for (let i = 0; i < this.config.MAX_STEP && t < this.config.MAX_DISTANCE; i++) {
            let r = this.scene(ox + dx * t, oy + dy * t);

            if (r.sd < this.config.EPSILON) {
                return r.emissive;
            }

            t += r.sd;
        }

        return 0;
    }
}
