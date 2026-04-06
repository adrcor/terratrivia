<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-row items-center justify-end gap-2 rounded-lg">
      <UButton to="/update-password">update password</UButton>
      <UButton label="logout" color="error" variant="solid" @click="onLogout" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "@/router";
import { useAuthStore } from "@/stores/auth";
import UButton from "@nuxt/ui/components/Button.vue";

const auth = useAuthStore();
const router = useRouter();

async function onLogout() {
  await auth.signOut();
  router.push({ name: "login" });
}
</script>
