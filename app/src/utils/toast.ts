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
  if (er.tag === "network_error") {
    useToast().add({
      title: "can't reach server",
      description: "check your connection and refresh the page",
      color: "error",
    });
    return;
  }
  if (er.tag === "unauthorized") {
    useToast().add({
      title: "session expired",
      description: "please log in again",
      color: "error",
    });
    return;
  }
  useToast().add({
    title: title ?? "error",
    description: er.message,
    color: "error",
  });
}
