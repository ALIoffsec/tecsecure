import assert from "node:assert/strict";
import test from "node:test";
import { parseVulNyxMachines } from "@/lib/vulnyx-catalog";

const machineRecord = (url = "https://mega.nz/file/example#download-key") => `ready:
  name: Ready
  os: Linux
  creator: d4t4s3c
  difficulty: Easy
  url: ${url}
  size: 640MB
  release: 18 Apr 2023
  status: Retired
  tested:
    - VirtualBox
`;

test("parses machine metadata while ignoring nested YAML fields", () => {
  const parsed = parseVulNyxMachines(`${machineRecord()}hat:
  name: Hat
  os: Linux
  creator: d4t4s3c
  difficulty: Medium
  url: https://mega.nz/file/another#key
`);

  assert.equal(parsed.ok, true);
  if (!parsed.ok) return;
  assert.equal(parsed.machines.length, 2);
  assert.equal(parsed.machines[0].name, "Ready");
  assert.equal(parsed.machines[0].downloadUrl, "https://mega.nz/file/example#download-key");
  assert.equal(parsed.machines[0].status, "Retired");
});

test("rejects download links outside the official VulNyx download host", () => {
  const parsed = parseVulNyxMachines(machineRecord("https://example.com/machine.vmdk"));

  assert.equal(parsed.ok, false);
});

test("reports an empty or malformed catalog instead of returning a success-shaped empty list", () => {
  assert.equal(parseVulNyxMachines("# no machine records").ok, false);
  assert.equal(parseVulNyxMachines("ready:\n  name: Ready").ok, false);
});
