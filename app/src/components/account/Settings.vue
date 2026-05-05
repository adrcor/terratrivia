<template>
  <div class="flex w-full flex-col gap-4">
    <h2 class="weight-bold text-muted text-xl">practice settings</h2>
    <div class="ml-4 flex flex-col gap-4">
      <h3 class="weight-bold text-muted text-lg">reset practice</h3>
      <div class="flex flex-row justify-between gap-2">
        <TrialOptions :show="true" />
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
import TrialOptions from "@/components/TrialOptions.vue";
import { useRouter } from "@/router";
import { useAuthStore } from "@/stores/auth";
import { usePracticeStore } from "@/stores/practice";
import { useSettingsStore } from "@/stores/settings";
import { clearAll } from "@/utils/sync";
import UButton from "@nuxt/ui/components/Button.vue";
import USeparator from "@nuxt/ui/components/Separator.vue";

const auth = useAuthStore();
const router = useRouter();
const practice = usePracticeStore();
const settings = useSettingsStore();

async function onLogout() {
  await auth.signOut();
  clearAll();
  router.push({ name: "login" });
}

function onResetPractice() {
  practice.reset(settings.mode, settings.region);
}
</script>
