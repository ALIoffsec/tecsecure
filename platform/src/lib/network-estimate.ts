export type NetworkInput = { workplaces: number; floors: number; areaM2: number; wifiUsers: number; server: boolean; cameras: number };

const SPARE_PORTS = 1.2;
const AVERAGE_RUN_METRES = 30;
const CABLE_BOX_METRES = 305;
const POE_WATTS_AP = 15;
const POE_WATTS_CAMERA = 12;

/**
 * A first estimate of quantities, deliberately rounded up. Walls, risers and existing wiring change
 * the real answer, so the result is always marked preliminary until a site survey.
 */
export function buildNetworkEstimate(input: NetworkInput) {
  const accessPoints = Math.max(1, Math.ceil(input.areaM2 / 120), Math.ceil(input.wifiUsers / 25));
  const wiredDesks = Math.ceil(input.workplaces * SPARE_PORTS);
  const ports = wiredDesks + accessPoints + input.cameras + (input.server ? 2 : 0);
  const large = Math.floor(ports / 48);
  const rest = ports - large * 48;
  const switches: { ports: 24 | 48; count: number }[] = [];
  if (large > 0) switches.push({ ports: 48, count: large });
  if (rest > 24) {
    const existing = switches.find(item => item.ports === 48);
    if (existing) existing.count += 1;
    else switches.push({ ports: 48, count: 1 });
  } else if (rest > 0) {
    switches.push({ ports: 24, count: 1 });
  }
  const switchPorts = switches.reduce((sum, item) => sum + item.ports * item.count, 0);
  const cableMetres = Math.ceil(ports * AVERAGE_RUN_METRES * (1 + (input.floors - 1) * .1));
  const poeWatts = accessPoints * POE_WATTS_AP + input.cameras * POE_WATTS_CAMERA;
  const switchCount = switches.reduce((sum, item) => sum + item.count, 0);
  return {
    preliminary: true as const,
    accessPoints,
    ports,
    switches,
    switchPorts,
    cableMetres,
    cableBoxes: Math.max(1, Math.ceil(cableMetres / CABLE_BOX_METRES)),
    poeWatts,
    rackUnits: 2 + switchCount * 2 + (input.server ? 4 : 0),
    routers: 1,
    ups: input.server || ports > 48 ? 2 : 1,
    floorsNote: input.floors > 1
  };
}
