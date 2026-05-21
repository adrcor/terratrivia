import { useAuthStore } from "@/stores/auth";
import { useGeoStore } from "@/stores/geo";
import { usePracticeStore } from "@/stores/practice";
import { useTrialStore } from "@/stores/trial";
import type { Er } from "@/utils/errors";
import { notifyError } from "@/utils/toast";

export async function syncAll() {
  const authStore = useAuthStore();
  const geoStore = useGeoStore();
  const trialStore = useTrialStore();
  const practiceStore = usePracticeStore();

  const authResult = await authStore.sync();

  const authedTasks = authStore.isAuthenticated
    ? [
        trialStore.syncHighscores(),
        trialStore.syncResults(),
        practiceStore.sync(),
      ]
    : [];
  const results = await Promise.all([geoStore.sync(), ...authedTasks]);

  const errors: Array<Er<string>> = [];
  for (const r of [authResult, ...results]) {
    if (r.isErr()) errors.push(r.error);
  }

  const networkErr = errors.find((e) => e.tag === "network_error");
  if (networkErr) {
    notifyError(networkErr);
    return;
  }
  const unauthorizedErr = errors.find((e) => e.tag === "unauthorized");
  if (unauthorizedErr) {
    authStore.clear();
    notifyError(unauthorizedErr);
    return;
  }
  for (const e of errors) {
    notifyError(e);
  }
}

export function clearAll() {
  const authStore = useAuthStore();
  const trialStore = useTrialStore();
  const practiceStore = usePracticeStore();

  authStore.clear();
  trialStore.clear();
  practiceStore.clear();
}
