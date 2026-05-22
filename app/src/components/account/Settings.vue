<template>
  <div class="flex w-full flex-col gap-4">
    <h2 class="weight-bold text-muted text-xl">scoring settings</h2>
    <div class="ml-4 flex flex-col gap-4">
      <div class="flex flex-col gap-2">
        <h3 class="weight-bold text-muted text-lg">preset</h3>
        <div class="flex flex-row items-center gap-2">
          <UButton
            v-for="name in presetNames"
            :key="name"
            :variant="activePreset === name ? 'solid' : 'outline'"
            color="neutral"
            @click="applyPreset(name)"
            >{{ name }}</UButton
          >
          <span v-if="activePreset === null" class="text-muted ml-2 text-sm"
            >(custom)</span
          >
        </div>
      </div>
      <UCollapsible v-model:open="advancedOpen">
        <UButton
          variant="ghost"
          color="neutral"
          :icon="
            advancedOpen
              ? 'i-lucide-chevron-down'
              : 'i-lucide-chevron-right'
          "
          >advanced</UButton
        >
        <template #content>
          <div class="mt-2 grid grid-cols-[auto_8rem] items-center gap-x-4 gap-y-2">
            <label class="text-muted text-sm">reaction target (ms)</label>
            <UInputNumber
              v-model="settings.scoring.reactionTarget"
              :min="200"
              :max="5000"
              :step="50"
            />
            <label class="text-muted text-sm">typing target (wpm)</label>
            <UInputNumber
              v-model="settings.scoring.wpmTarget"
              :min="10"
              :max="300"
              :step="5"
            />
            <label class="text-muted text-sm">validation score (%)</label>
            <UInputNumber
              v-model="settings.scoring.validationScore"
              :min="0"
              :max="100"
              :step="5"
            />
          </div>
        </template>
      </UCollapsible>
    </div>
    <USeparator />
    <h2 class="weight-bold text-muted text-xl">practice settings</h2>
    <div class="ml-4 flex flex-col gap-4">
      <h3 class="weight-bold text-muted text-lg">reset practice</h3>
      <div class="flex flex-row justify-between gap-2">
        <Options :show="true" />
        <UButton
          class="self-end text-center"
          @click="onResetPractice"
          color="error"
          >reset region + mode</UButton
        >
      </div>
    </div>
    <USeparator />
    <h2 class="weight-bold text-muted text-xl">account settings</h2>
    <div class="ml-4 flex flex-col gap-4">
      <div class="flex flex-row justify-between gap-2">
        <h3 class="weight-bold text-muted text-lg">update your password</h3>
        <UButton to="/update-password" class="self-end text-center"
          >update password</UButton
        >
      </div>
      <div class="flex flex-row justify-between gap-2">
        <h3 class="weight-bold text-muted text-lg">sign out</h3>
        <UButton
          label="sign out"
          color="error"
          variant="solid"
          @click="onLogout"
        />
      </div>
    </div>
    <USeparator />
  </div>
</template>

<script setup lang="ts">
import Options from "@/components/game/Options.vue";
import { useRouter } from "@/router";
import { useAuthStore } from "@/stores/auth";
import { PRESETS, type PresetName } from "@/stores/constants";
import { usePracticeStore } from "@/stores/practice";
import { useSettingsStore } from "@/stores/settings";
import { clearAll } from "@/utils/sync";
import UButton from "@nuxt/ui/components/Button.vue";
import UCollapsible from "@nuxt/ui/components/Collapsible.vue";
import UInputNumber from "@nuxt/ui/components/InputNumber.vue";
import USeparator from "@nuxt/ui/components/Separator.vue";
import { computed, ref } from "vue";

const auth = useAuthStore();
const router = useRouter();
const practice = usePracticeStore();
const settings = useSettingsStore();
const advancedOpen = ref(false);

const presetNames = Object.keys(PRESETS) as Array<PresetName>;

const activePreset = computed<PresetName | null>(() => {
  const s = settings.scoring;
  for (const name of presetNames) {
    const p = PRESETS[name];
    if (
      s.reactionTarget === p.reactionTarget &&
      s.wpmTarget === p.wpmTarget &&
      s.validationScore === p.validationScore
    ) {
      return name;
    }
  }
  return null;
});

function applyPreset(name: PresetName) {
  settings.scoring = { ...PRESETS[name] };
}

async function onLogout() {
  await auth.signOut();
  clearAll();
  router.push({ name: "login" });
}

function onResetPractice() {
  practice.reset(settings.mode, settings.region);
}
</script>
