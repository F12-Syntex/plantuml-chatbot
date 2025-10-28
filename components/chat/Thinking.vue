<template>
  <div class="flex flex-col gap-3 items-start">
    <div class="avatar placeholder">
      <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-secondary to-accent">
        <MdiRobotOutline class="text-lg sm:text-xl text-secondary-content" />
      </div>
    </div>
    <div class="flex-1">
      <div class="bg-base-100 border border-base-300 rounded-2xl shadow-sm p-5 sm:p-6">
        <div class="flex items-center gap-2">
          <span class="loading loading-dots loading-sm text-primary"></span>
          <span class="text-sm text-base-content/60">Thinking...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MdiRobotOutline from '~icons/mdi/robot-outline'
</script>