<template>
  <div class="flex flex-col lg:flex-row">
    <Sidebar class="sidebar lg:block" />
    <main class="main-content flex-grow min-h-screen lg:min-h-0">
      <router-view></router-view>
    </main>
    <ErrorDisplay />
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'
import '@/assets/css/app.css';
import Sidebar from '@/components/Sidebar.vue'
import ErrorDisplay from '@/components/ErrorDisplay.vue'
import { useForexStore } from '@/stores'

const forexStore = useForexStore()

onUnmounted(() => {
  forexStore.disconnectWebSocket()
})
</script>
