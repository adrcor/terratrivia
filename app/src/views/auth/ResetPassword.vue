<template>
  <div class="flex flex-col items-center justify-center gap-2">
    <template v-if="!token">
      <h1 class="weight-bold text-2xl">invalid reset link</h1>
      <p>this link is invalid or has expired.</p>
      <Link to="/forgot-password" label="request a new one" />
    </template>
    <template v-else-if="!success">
      <UForm
        class="flex w-84 flex-col items-center justify-center gap-2 rounded-lg"
        :schema="schema"
        :state="state"
        @submit="onSubmit"
      >
        <h1 class="weight-bold text-2xl">reset password</h1>
        <UFormField label="new password" name="password" class="w-full">
          <UInput
            v-model="state.password"
            placeholder="********"
            type="password"
            autofocus
            class="w-full"
          />
          <template #error="{ error }">
            <ErrorMessage :message="error" />
          </template>
        </UFormField>
        <UFormField
          label="confirm password"
          name="confirmPassword"
          class="w-full"
        >
          <UInput
            v-model="state.confirmPassword"
            placeholder="********"
            type="password"
            class="w-full"
          />
          <template #error="{ error }">
            <ErrorMessage :message="error" />
          </template>
        </UFormField>
        <div class="flex w-full flex-row items-center justify-end">
          <UButton
            type="submit"
            color="neutral"
            variant="solid"
            label="reset password"
          />
        </div>
      </UForm>
      <ErrorMessage :message="errorMsg" />
    </template>
    <template v-else>
      <h1 class="weight-bold text-2xl">password reset</h1>
      <p>your password has been reset successfully.</p>
      <Link to="/login" label="back to login" icon="anron-gestalt:log-in" />
    </template>
  </div>
</template>

<script setup lang="ts">
import ErrorMessage from "@/components/ErrorMessage.vue";
import Link from "@/components/Link.vue";
import { useAuthStore } from "@/stores/auth";
import UButton from "@nuxt/ui/components/Button.vue";
import UForm from "@nuxt/ui/components/Form.vue";
import UFormField from "@nuxt/ui/components/FormField.vue";
import UInput from "@nuxt/ui/components/Input.vue";
import { reactive, ref } from "vue";
import { useRoute } from "vue-router";
import { z } from "zod";

const auth = useAuthStore();
const route = useRoute();
const token = ref((route.query.token as string) ?? "");

const schema = z
  .object({
    password: z
      .string("password is required")
      .min(8, "must be at least 8 characters"),
    confirmPassword: z.string("confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "passwords don't match",
    path: ["confirmPassword"],
  });

type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  password: undefined,
  confirmPassword: undefined,
});

const errorMsg = ref("");
const success = ref(false);

async function onSubmit() {
  const result = await auth.resetPassword(state.password ?? "", token.value);
  result.match(
    () => {
      success.value = true;
    },
    (error) => {
      errorMsg.value = error.message.split(": ")[1] ?? "";
    },
  );
}
</script>
