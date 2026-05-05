<template>
  <UTooltip
    :delay-duration="100"
    :content="{ side: 'bottom' }"
    :ui="{ content: 'h-fit text-sm font-mono' }"
    :disable-closing-trigger="true"
    :text="tooltip"
    :disabled="!tooltip"
  >
    <div
      class="text-muted hover:text-default flex flex-row items-center gap-2 transition-colors duration-100"
    >
      <Icon :icon="icon" class="size-6" />
      <div>
        {{ label }}
      </div>
    </div>
  </UTooltip>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue";
import UTooltip from "@nuxt/ui/components/Tooltip.vue";

const props = defineProps<{
  icon: string;
  label: string;
  tooltip?: string;
}>();
</script>
