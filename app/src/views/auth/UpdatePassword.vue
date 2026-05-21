<template>
  <div class="flex flex-col items-center justify-center gap-2">
    <UForm
      class="flex w-84 flex-col items-center justify-center gap-2 rounded-lg"
      :schema="schema"
      :state="state"
      @submit="onSubmit"
    >
      <h1 class="weight-bold text-2xl">update password</h1>
      <UFormField
        label="current password"
        name="currentPassword"
        class="w-full"
      >
        <UInput
          v-model="state.currentPassword"
          placeholder="********"
          type="password"
          autofocus
          class="w-full"
        />
        <template #error="{ error }">
          <ErrorMessage :message="error" />
        </template>
      </UFormField>
      <UFormField label="new password" name="newPassword" class="w-full">
        <UInput
          v-model="state.newPassword"
          placeholder="********"
          type="password"
          class="w-full"
        />
        <template #error="{ error }">
          <ErrorMessage :message="error" />
        </template>
      </UFormField>
      <UFormField
        label="confirm new password"
        name="confirmNewPassword"
        class="w-full"
      >
        <UInput
          v-model="state.confirmNewPassword"
          placeholder="********"
          type="password"
          class="w-full"
        />
        <template #error="{ error }">
          <ErrorMessage :message="error" />
        </template>
      </UFormField>
      <div class="flex w-full flex-row items-center justify-between">
        <Link to="/account" label="back" />
        <UButton
          type="submit"
          color="neutral"
          variant="solid"
          label="update password"
        />
      </div>
    </UForm>
    <span v-if="msg" :class="success ? 'text-green-400' : 'text-red-300'">{{
      msg
    }}</span>
  </div>
</template>

<script setup lang="ts">
import ErrorMessage from "@/components/ErrorMessage.vue";
import Link from "@/components/Link.vue";
import { useAuthStore } from "@/stores/auth";
import { notifyError } from "@/utils/toast";
import UButton from "@nuxt/ui/components/Button.vue";
import UForm from "@nuxt/ui/components/Form.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { reactive, ref } from "vue";
import { z } from "zod";

const auth = useAuthStore();
const schema = z
  .object({
    currentPassword: z
      .string("current password is required")
      .min(1, "current password is required"),
    newPassword: z
      .string("new password is required")
      .min(8, "must be at least 8 characters"),
    confirmNewPassword: z.string("confirm password is required"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "passwords don't match",
    path: ["confirmNewPassword"],
  });

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  currentPassword: undefined,
  newPassword: undefined,
  confirmNewPassword: undefined,
});

const msg = ref("");
const success = ref(false);

async function onSubmit() {
  const result = await auth.changePassword(
    state.currentPassword ?? "",
    state.newPassword ?? "",
  );
  result.match(
    () => {
      msg.value = "password updated";
      success.value = true;
      state.currentPassword = undefined;
      state.newPassword = undefined;
      state.confirmNewPassword = undefined;
    },
    (error) => {
      if (error.tag === "network_error") {
        notifyError(error);
        return;
      }
      msg.value = error.message.split(": ")[1] ?? "";
      success.value = false;
    },
  );
}
</script>
