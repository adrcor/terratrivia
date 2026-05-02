<template>
  <div class="flex flex-col gap-2">
    <input
      ref="refInput"
      class="weight-bold h-12 w-full rounded-md px-4 text-center text-xl text-neutral-300 caret-neutral-300 outline-none"
      @blur="focus"
      v-model="message"
      placeholder=""
    />
    <div class="self-center text-lg text-neutral-500">
      {{ hint ? expected : "\u00A0" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InputAnswer } from "@/types/common";
import { onMounted, ref, watch } from "vue";

const message = ref("");
const refInput = ref<HTMLInputElement>();

let startingTime = 0;
let reactionTime = 0;
let totalTime = 0;
const hint = ref(false);

const props = defineProps<{
  expected: string;
}>();

const emit = defineEmits<{
  (e: "answer", result: InputAnswer): void;
}>();

watch(
  () => props.expected,
  () => {
    reset();
    startingTime = Date.now();
  },
);

watch(message, (newVal: string) => {
  if (props.expected.length === 0) {
    message.value = "";
    return;
  }
  if (newVal.slice(-1) === "/") {
    hint.value = true;
    message.value = message.value.replace("/", "");
    return;
  }
  if (
    reactionTime === 0 &&
    normalize(newVal.charAt(0)) === normalize(props.expected.charAt(0))
  ) {
    reactionTime = Date.now() - startingTime;
  }
  if (normalize(newVal) === normalize(props.expected)) {
    totalTime = Date.now() - startingTime;
    const inputResult: InputAnswer = {
      answer: props.expected,
      valid: !hint.value,
      reaction_time: reactionTime,
      typing_time: totalTime - reactionTime,
    };
    emit("answer", inputResult);
  }
});

onMounted(() => {
  focus();
});

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function focus() {
  refInput.value?.focus();
}

function reset() {
  message.value = "";
  hint.value = false;
  startingTime = 0;
  reactionTime = 0;
  totalTime = 0;
}
</script>
