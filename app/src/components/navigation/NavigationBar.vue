<template>
  <nav
    v-if="width > 1024"
    class="group/nav flex w-full max-w-4xl flex-row items-center justify-between gap-8 p-8"
  >
    <HomeButton />
    <div class="flex flex-row items-center justify-between gap-8">
      <Link to="/trial" icon="anron-gestalt:clock" label="trial"></Link>
      <Link
        v-if="auth.id"
        to="/account"
        icon="anron-gestalt:user"
        label="account"
        size="lg"
      ></Link>
      <Link v-else to="/login" icon="anron-gestalt:log-in" label="login"></Link>
    </div>
  </nav>
  <nav
    v-else
    class="group/nav flex w-full max-w-4xl flex-row items-center justify-between gap-8 p-8"
  >
    <HomeButton />

    <div class="flex flex-row items-center justify-between gap-8">
      <Link to="/trial" icon="anron-gestalt:clock"></Link>
      <Link v-if="auth.id" to="/account" icon="anron-gestalt:user"></Link>
      <Link v-else to="/login" icon="anron-gestalt:log-in"></Link>
    </div>
  </nav>
</template>

<script setup lang="ts">
import Link from "../Link.vue";
import HomeButton from "./HomeButton.vue";
import { useKeydown } from "@/composables/keydown";
import { useAuthStore } from "@/stores/auth";
import { useStatusStore } from "@/stores/status";
import { useWindowSize } from "@vueuse/core";
import { useRoute, useRouter } from "vue-router";

const auth = useAuthStore();
const status = useStatusStore();
const router = useRouter();
const route = useRoute();
const { width } = useWindowSize();

useKeydown({
  Escape: () => {
    if (!status.running && route.name != "home") {
      router.push("/");
    }
  },
});
</script>
