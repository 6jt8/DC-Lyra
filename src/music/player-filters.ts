export const PLAYER_FILTER_OPTIONS = [
  { label: "Karaoke", value: "karaoke" },
  { label: "Timescale", value: "timescale" },
  { label: "Tremolo", value: "tremolo" },
  { label: "Vibrato", value: "vibrato" },
  { label: "3D", value: "rotation" },
  { label: "Distortion", value: "distortion" },
  { label: "Channel Mix", value: "channelmix" },
  { label: "Low Pass", value: "lowpass" },
  { label: "Bassboost", value: "bassboost" },
  { label: "Nightcore", value: "nightcore" },
  { label: "Daycore", value: "daycore" },
] as const;

export async function applyFilterByKey(
  player: any,
  selectedFilter: string
): Promise<boolean> {
  try {
    switch (selectedFilter) {
      case "karaoke":
        player.filters.setKaraoke(true);
        break;
      case "timescale":
        player.filters.setTimescale(true, { speed: 1.2, pitch: 1.2 });
        break;
      case "tremolo":
        player.filters.setTremolo(true, { frequency: 4, depth: 0.75 });
        break;
      case "vibrato":
        player.filters.setVibrato(true, { frequency: 4, depth: 0.75 });
        break;
      case "rotation":
        player.filters.setRotation(true, { rotationHz: 0.2 });
        break;
      case "distortion":
        player.filters.setDistortion(true, {
          sinScale: 1,
          cosScale: 1,
        });
        break;
      case "channelmix":
        player.filters.setChannelMix(true, {
          leftToLeft: 0.5,
          leftToRight: 0.5,
          rightToLeft: 0.5,
          rightToRight: 0.5,
        });
        break;
      case "lowpass":
        player.filters.setLowPass(true, { smoothing: 0.5 });
        break;
      case "bassboost":
        player.filters.setBassboost(true, { value: 3 });
        break;
      case "nightcore":
        player.filters.setTimescale(true, {
          speed: 1.25,
          pitch: 1.25,
          rate: 1.0,
        });
        break;
      case "daycore":
        player.filters.setTimescale(true, {
          speed: 1.0,
          pitch: 0.8,
          rate: 1.0,
        });
        break;
      default:
        return false;
    }
    return true;
  } catch (error) {
    console.error(`Error applying filter ${selectedFilter}:`, error);
    return false;
  }
}
