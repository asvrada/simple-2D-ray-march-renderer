<template>
    <div>
        <div id="control">
            <div>
                <p>Preset, the quicker, the lower the quality</p>
                <button @click="preset(0)">Fast</button>
                <button @click="preset(1)">Normal</button>
                <button @click="preset(2)">Slow</button>
                <button @click="preset(3)">Slowest</button>

                <p>Resolution of canvas. Recommend < 512 x 512</p>
                <input type="number" placeholder="Resolution" v-model="input_resolution">
                <p>Sample Count Per Pixel.Recommend 32</p>
                <input type="number" placeholder="Sample Count" v-model="input_N">
                <p>Ray March Iteration. Recommend < 8</p>
                <input type="number" placeholder="Ray March Iteration" v-model="input_MAX_STEP">
            </div>

            <div>
                <button v-on:click="draw" v-show="showBtn">Draw</button>
                <button v-on:click="abort" v-show="!aborted">Abort</button>
            </div>
            <p>To clean the canvas, please refresh this page</p>
        </div>

        <div id="canvas">
            <canvas ref="canvas"></canvas>
        </div>
    </div>
</template>

<script>
    import {App} from '../ray/App';
    import {MAX_DISTANCE, EPSILON, N, MAX_STEP, WIDTH, HEIGHT} from '../ray/Consts';

    export default {
        name: "RayCanvas",
        data() {
            return {
                instance: null,
                showBtn: true,
                aborted: false,
                config: null,
                input_resolution: WIDTH,
                input_N: N,
                input_MAX_STEP: MAX_STEP
            };
        },
        methods: {
            preset(num) {
                num = num || 0;
                switch (num) {
                    case 0:
                        this.input_N = 8;
                        this.input_MAX_STEP = 4;
                        break;
                    case 1:
                        this.input_N = 8;
                        this.input_MAX_STEP = 8;
                        break;
                    case 2:
                        this.input_N = 32;
                        this.input_MAX_STEP = 32;
                        break;
                    case 3:
                        this.input_N = 256;
                        this.input_MAX_STEP = 64;
                        break;
                    default:
                        break;
                }
            },
            draw() {
                // draw
                this.config = {
                    MAX_DISTANCE,
                    EPSILON,
                    N: parseInt(this.input_N),
                    MAX_STEP: parseInt(this.input_MAX_STEP),
                    WIDTH: parseInt(this.input_resolution),
                    HEIGHT: parseInt(this.input_resolution)
                };

                this.instance = new App(this.$refs.canvas, this.config);

                this.showBtn = false;

                const self = this;
                setTimeout(() => {
                    self.instance.run();
                });
            },
            abort() {
                this.aborted = true;

                this.instance.abort = true;
            }
        }
    };
</script>

<style scoped>
    #control {
        display: block;
    }

    #canvas {
        display: block;
    }
</style>