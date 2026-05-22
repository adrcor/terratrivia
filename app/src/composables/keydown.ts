import { onMounted, onUnmounted } from "vue";

type KeyHandler =
  | (() => void)
  | {
      handler: () => void;
      preventDefault?: boolean;
      stopPropagation?: boolean;
    };

export function useKeydown(map: Record<string, KeyHandler>): void {
  function listener(event: KeyboardEvent) {
    if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
      return;
    }
    const entry = map[event.key];
    if (!entry) {
      return;
    }
    if (typeof entry === "function") {
      entry();
      return;
    }
    if (entry.preventDefault) event.preventDefault();
    if (entry.stopPropagation) event.stopPropagation();
    entry.handler();
  }

  onMounted(() => window.addEventListener("keydown", listener));
  onUnmounted(() => window.removeEventListener("keydown", listener));
}
