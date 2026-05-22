import { syncAll } from "./sync";
import { usePracticeStore } from "@/stores/practice";
import { useTrialStore } from "@/stores/trial";

export function hasPendingData(): boolean {
  const trialStore = useTrialStore();
  const practiceStore = usePracticeStore();

  if (trialStore.pendingResults.length > 0) return true;
  for (const unit of Object.values(practiceStore.units)) {
    if (unit && unit.count > 0) return true;
  }
  return false;
}

export async function acceptMerge(): Promise<void> {
  const trialStore = useTrialStore();
  const practiceStore = usePracticeStore();

  await trialStore.uploadPending();
  await practiceStore.mergeLocalIntoServer();
  await syncAll();
}

export async function rejectMerge(): Promise<void> {
  const trialStore = useTrialStore();
  trialStore.clearPending();
  await syncAll();
}
