<template>
  <UTooltip
    :text="text"
    :kbds="[kbd]"
    :delay-duration="200"
    :content="{ side }"
    :ui="{
      content: 'text-sm bg-neutral-950 outline-1 outline-neutral-700',
      kbdsSize: 'md',
    }"
  >
    <slot />
  </UTooltip>
</template>

<script setup lang="ts">
import UTooltip from "@nuxt/ui/components/Tooltip.vue";
import { onMounted, onUnmounted } from "vue";

const props = withDefaults(
  defineProps<{
    text: string;
    kbd: string;
    side?: "top" | "bottom" | "left" | "right";
    enabled?: boolean;
  }>(),
  { side: "right", enabled: true },
);

const emit = defineEmits<{ trigger: [] }>();

function listener(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
  if (event.key === props.kbd && props.enabled) emit("trigger");
}

onMounted(() => window.addEventListener("keydown", listener));
onUnmounted(() => window.removeEventListener("keydown", listener));
</script>
