<template>
  <canvas id="webgl-canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import Shader from "./index";

onMounted(() => {
  Shader.run();
});
</script>

<style scoped>
#webgl-canvas {
  width: 512px;
  height: 288px;
}
</style>
