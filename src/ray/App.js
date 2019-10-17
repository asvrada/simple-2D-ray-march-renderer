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
      sum += this.trace(x, y, Math.cos(a), Math.sin(a));
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
  }

  // 光线步进
  trace(ox, oy, dx, dy, depth = 0) {
    let t = 0;
    for (let i = 0; i < this.config.MAX_STEP && t < this.config.MAX_DISTANCE; i++) {
      const x = ox + dx * t;
      const y = oy + dy * t;
      let r = this.scene(x, y);

      if (r.sd < this.config.EPSILON) {
        let sum = r.emissive;
        if (depth < MAX_DEPTH && r.reflectivity > 0.0) {
          let nx, ny, rx, ry, ret;
          ret = this.gradient(x, y);
          nx = ret.nx;
          ny = ret.ny;
          ret = this.reflect(dx, dy, nx, ny);
          rx = ret.rx;
          ry = ret.ry;

          sum += r.reflectivity * this.trace(x + nx * BIAS, y + ny * BIAS, rx, ry, depth + 1);
        }
        return sum;
      }

      t += r.sd;
    }

    return 0;
  }

  // 求反射法线
  reflect(ix, iy, nx, ny) {
    let idotn2 = (ix * nx + iy * ny) * 2.0;
    let rx = ix - idotn2 * nx;
    let ry = iy - idotn2 * ny;
    return {rx, ry};
  }

  // 求梯度
  gradient(x, y) {
    let nx = (this.scene(x + this.config.EPSILON, y).sd - this.scene(x - this.config.EPSILON, y).sd) * (0.5 / this.config.EPSILON);
    let ny = (this.scene(x, y + this.config.EPSILON).sd - this.scene(x, y - this.config.EPSILON).sd) * (0.5 / this.config.EPSILON);
    return {nx, ny};
  }

  // 求折射
  refract(ix, iy, nx, ny, eta, rxry) {
    let idotn = ix * nx + iy * ny;
    let k = 1.0 - eta * eta * (1.0 - idotn * idotn);
    if (k < 0.0) {
      // 全内反射
      return 0;
    }

    let a = eta * idotn + Math.sqrt(k);
    rxry.rx = eta * ix - a * nx;
    rxry.ry = eta * iy - a * ny;

    return 1;
  }
}