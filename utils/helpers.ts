import * as Haptics from "expo-haptics";

export const playHapticDrumRoll = async () => {
  const numberOfBeats = 10;
  const delayBetweenBeats = 50; // 50ms between each beat for a fast drum roll

  for (let i = 0; i < numberOfBeats; i++) {
    await new Promise((resolve) => setTimeout(resolve, delayBetweenBeats));
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};
