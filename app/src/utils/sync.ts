import { useAuthStore } from "@/stores/auth";
import { useGeoStore } from "@/stores/geo";
import { usePracticeStore } from "@/stores/practice";
import { useTrialStore } from "@/stores/trial";

export async function syncAll() {
  const authStore = useAuthStore();
  const geoStore = useGeoStore();
  const trialStore = useTrialStore();
  const practiceStore = usePracticeStore();

  await authStore.sync();
  geoStore.sync();
  trialStore.syncHighscores();
  trialStore.syncResults();
  practiceStore.sync();
}

export function clearAll() {
  const trialStore = useTrialStore();
  const practiceStore = usePracticeStore();

  trialStore.clear();
  practiceStore.clear();
}
