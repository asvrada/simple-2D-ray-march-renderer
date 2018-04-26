<template>
    <div>
        <div id="control">
            <p>画布分辨率，推荐512及以下</p>
            <input type="number" placeholder="分辨率" v-model="resolution">
            <p>采样数，越高越清晰，渲染也越慢，推荐32</p>
            <input type="number" placeholder="采样数" v-model="input_N">
            <p>光线步进次数，由于场景特殊性，建议8以下</p>
            <input type="number" placeholder="光线步进次数" v-model="input_MAX_STEP">

            <button v-on:click="draw" v-show="showBtn">Draw</button>
            <button v-on:click="abort" v-show="!aborted">Abort</button>
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
                resolution: WIDTH,
                input_N: N,
                input_MAX_STEP: MAX_STEP
            };
        },
        methods: {
            draw() {
                // draw
                this.config = {
                    MAX_DISTANCE,
                    EPSILON,
                    N: parseInt(this.input_N),
                    MAX_STEP: parseInt(this.input_MAX_STEP),
                    WIDTH: parseInt(this.resolution),
                    HEIGHT: parseInt(this.resolution)
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