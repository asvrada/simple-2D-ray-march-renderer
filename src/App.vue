<template>
    <div id="app">
        <h1>2D Ray March render</h1>
        <h2>Please use Chrome. Somehow its faster.</h2>
        <p>In this demo, refraction and reflection is disabled. It will draw the Aperture Science Logo from the game Portal:</p>
        <img src="./assets/as.png" alt="">
        <ray-canvas></ray-canvas>
    </div>
</template>

<script>
  import RayCanvas from './components/RayCanvas';

  export default {
    name: 'app',
    components: {
      RayCanvas
    }
  };
</script>

<style>
</style>
