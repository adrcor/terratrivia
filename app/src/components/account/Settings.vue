<template>
  <div class="flex w-full flex-col gap-4">
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
import { useRouter } from "@/router";
import { useAuthStore } from "@/stores/auth";
import { useTrialStore } from "@/stores/trial";
import UButton from "@nuxt/ui/components/Button.vue";
import USeparator from "@nuxt/ui/components/Separator.vue";

const auth = useAuthStore();
const trial = useTrialStore();
const router = useRouter();

async function onLogout() {
  trial.clear();
  await auth.signOut();
  router.push({ name: "login" });
}
</script>
