<template>
    <div>
        <div id="control">
            <div>
                <p>预设配置</p>
                <button @click="preset(0)">快</button>
                <button @click="preset(1)">中</button>
                <button @click="preset(2)">慢</button>
                <button @click="preset(3)">最慢</button>

                <p>画布分辨率，推荐512及以下</p>
                <input type="number" placeholder="分辨率" v-model="input_resolution">
                <p>采样数，越高越清晰，渲染也越慢，推荐32</p>
                <input type="number" placeholder="采样数" v-model="input_N">
                <p>光线步进次数，由于场景特殊性，建议8以下</p>
                <input type="number" placeholder="光线步进次数" v-model="input_MAX_STEP">
            </div>

            <div>
                <button v-on:click="draw" v-show="showBtn">Draw</button>
                <button v-on:click="abort" v-show="!aborted">Abort</button>
            </div>
            <p>若要重新绘制，请刷新浏览器</p>
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
        name: "JeffCanvas",
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
                        this.input_N = 64;
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