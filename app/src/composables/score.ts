import { useSettingsStore } from "@/stores/settings";
import type { CountryStats } from "@/types/practice";
import { practiceScoreColor } from "@/utils/color";
import * as Score from "@/utils/score";

export function useScores() {
  const settings = useSettingsStore();
  return {
    reactionScore: (rt: number) =>
      Score.reactionScore(rt, settings.scoring.reactionTarget),
    wpmScore: (wpm: number) => Score.wpmScore(wpm, settings.scoring.wpmTarget),
    typingScore: (tt: number, len: number) =>
      Score.typingScore(tt, len, settings.scoring.wpmTarget),
    totalScore: (rt: number, tt: number, len: number) =>
      Score.totalScore(
        rt,
        tt,
        len,
        settings.scoring.reactionTarget,
        settings.scoring.wpmTarget,
      ),
    countryScore: (stats: CountryStats) =>
      Score.countryScore(
        stats,
        settings.scoring.reactionTarget,
        settings.scoring.wpmTarget,
      ),
    practiceColor: (value: number) =>
      practiceScoreColor(value, settings.scoring.validationScore),
  };
}
