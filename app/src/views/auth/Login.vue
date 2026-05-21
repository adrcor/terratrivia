<template>
  <div class="flex flex-col items-center justify-center gap-2">
    <UForm
      class="flex w-84 flex-col items-center justify-center gap-2 rounded-lg"
      :schema="schema"
      :state="state"
      @submit="onSubmit"
    >
      <h1 class="weight-bold text-2xl">login</h1>
      <UFormField label="email" name="email" class="w-full">
        <UInput
          v-model="state.email"
          placeholder="email"
          autofocus
          class="w-full"
        />
        <template #error="{ error }">
          <ErrorMessage :message="error" />
        </template>
      </UFormField>
      <UFormField label="password" name="password" class="w-full">
        <UInput
          v-model="state.password"
          placeholder="********"
          type="password"
          class="w-full"
        />
        <template #error="{ error }">
          <ErrorMessage :message="error" />
        </template>
      </UFormField>
      <div class="flex w-full flex-row items-center justify-between">
        <Link to="/forgot-password" label="forgot password?" />
        <UButton type="submit" color="neutral" variant="solid" label="login" />
      </div>
    </UForm>
    <Link to="/register" label="register" icon="anron-gestalt:user-plus" />
    <ErrorMessage :message="errorMsg" />
  </div>
</template>

<script setup lang="ts">
import ErrorMessage from "@/components/ErrorMessage.vue";
import Link from "@/components/Link.vue";
import { useRouter } from "@/router";
import { useAuthStore } from "@/stores/auth";
import { syncAll } from "@/utils/sync";
import { notifyError } from "@/utils/toast";
import UButton from "@nuxt/ui/components/Button.vue";
import UForm from "@nuxt/ui/components/Form.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { reactive, ref, watch } from "vue";
import { z } from "zod";

const auth = useAuthStore();
const router = useRouter();
const schema = z.object({
  email: z.email("invalid email"),
  password: z
    .string("password is required")
    .min(8, "must be at least 8 characters"),
});

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  email: undefined,
  password: undefined,
});

const errorMsg = ref("");

watch(
  () => auth.isAuthenticated,
  (isAuthenticated) => {
    if (isAuthenticated) {
      syncAll();
      router.push({ name: "account" });
    }
  },
);

async function onSubmit() {
  const result = await auth.signIn(state.email ?? "", state.password ?? "");
  result.orTee((error) => {
    if (error.tag === "network_error") {
      notifyError(error);
      return;
    }
    errorMsg.value = error.message.split(": ")[1] ?? "";
  });
}
</script>
