export type CctvInput = {
  cameraCount: number;
  bitrateMbps?: number;
  retentionDays: number;
  recordingHoursPerDay: number;
  cameraCountGrowth?: number;
  poeWattsPerCamera?: number;
};

export function buildCctvEstimate(input: CctvInput) {
  const cameras = Math.max(1, Math.min(256, Math.floor(input.cameraCount)));
  const retentionDays = Math.max(1, Math.min(365, Math.floor(input.retentionDays)));
  const hours = Math.max(1, Math.min(24, input.recordingHoursPerDay));
  const bitrate = Math.max(0.1, Math.min(32, input.bitrateMbps ?? 4));
  const growth = Math.max(0, Math.min(128, Math.floor(input.cameraCountGrowth ?? 0)));
  const watts = Math.max(1, Math.min(90, input.poeWattsPerCamera ?? 12));

  const storageTB = cameras * bitrate * 1000 * 3600 * hours * retentionDays / 8 / 1_000_000_000;
  const storageWithHeadroomTB = Math.ceil(storageTB * 1.2 * 10) / 10;
  const plannedPorts = cameras + growth;
  const switchCount = Math.ceil(plannedPorts / 24);
  const poeBudgetWatts = Math.ceil(plannedPorts * watts * 1.25);

  return {
    preliminary: true,
    assumptions: [
      `Bitrate ${bitrate} Mbps per camera; replace with verified device encoding settings.`,
      "Storage includes 20% headroom and excludes RAID/filesystem overhead.",
      "Cable length cannot be determined from floor area; requires a site survey."
    ],
    cameraCount: cameras,
    nvrChannels: Math.ceil(plannedPorts / 8) * 8,
    estimatedStorageTB: storageWithHeadroomTB,
    recordingBandwidthMbps: Math.ceil(cameras * bitrate * 1.15),
    poeSwitches24Port: switchCount,
    poeBudgetWatts,
    cableEstimate: null,
    needsTechnicalReview: true
  };
}
