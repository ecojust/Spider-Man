<template>
  <Shader />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { invoke } from "@tauri-apps/api/core";
import Shader from "./components/shader/index.vue";
</script>

<style scoped></style>
