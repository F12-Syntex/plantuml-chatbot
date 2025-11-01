<template>
  <div class="flex flex-col gap-3 items-start sm:items-center w-full px-4">
    <!-- Avatar -->
    <div class="avatar placeholder">
      <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-secondary to-accent flex items-center justify-center">
        <MdiRobotOutline class="text-lg sm:text-xl text-secondary-content" />
      </div>
    </div>

    <!-- Card container -->
    <div class="bg-base-100 border border-base-300 rounded-2xl shadow-sm w-full max-w-lg p-5 sm:p-8">
      <div class="flex flex-col gap-4">
        <div class="flex items-center gap-3 flex-wrap">
          <span class="loading loading-spinner loading-sm sm:loading-md text-primary"></span>
          <span class="text-sm sm:text-base font-medium">Designing your business card...</span>
        </div>

        <!-- Visual preview placeholder -->
        <div class="flex flex-wrap justify-center gap-4 mt-2 w-full">
          <!-- Front design skeleton -->
          <div class="w-32 h-20 sm:w-48 sm:h-28 border-2 border-dashed border-base-300/20 rounded-lg bg-base-200 flex flex-col p-3 animate-pulse">
            <div class="h-5 bg-base-300 rounded w-3/4"></div>
            <div class="h-3 bg-base-300 rounded w-1/2"></div>
            <div class="mt-auto space-y-2">
              <div class="h-2.5 bg-base-300 rounded w-2/3"></div>
              <div class="h-2.5 bg-base-300 rounded w-1/2"></div>
            </div>
          </div>

          <!-- Back design skeleton -->
          <div class="w-32 h-20 sm:w-48 sm:h-28 border-2 border-dashed border-base-300/20 rounded-lg bg-base-200 flex flex-col p-3 animate-pulse">
            <div class="h-3 bg-base-300 rounded w-full"></div>
            <div class="h-3 bg-base-300 rounded w-full"></div>
            <div class="h-3 bg-base-300 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import MdiRobotOutline from '~icons/mdi/robot-outline'
</script>