import { syncAll } from "./sync";
import { usePracticeStore } from "@/stores/practice";
import { useTrialStore } from "@/stores/trial";

export function hasPendingData(): boolean {
  const trialStore = useTrialStore();
  const practiceStore = usePracticeStore();

  return (
    trialStore.pendingResults.length > 0 ||
    practiceStore.pendingKeys.length > 0
  );
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
