import type { Er } from "./errors";
import { useToast } from "@nuxt/ui/composables";

export function notifySuccess(title: string, description?: string): void {
  useToast().add({
    title,
    description,
    color: "info",
  });
}

export function notifyError<K extends string>(er: Er<K>, title?: string): void {
  if (er.tag === "sync_error") {
    useToast().add({
      title: title ?? "out of sync",
      description: er.message + " — refresh to reload",
      color: "error",
      duration: 0,
      actions: [
        {
          label: "refresh",
          onClick: () => window.location.reload(),
        },
      ],
    });
    return;
  }
  useToast().add({
    title: title ?? "error",
    description: er.message,
    color: "error",
  });
}
