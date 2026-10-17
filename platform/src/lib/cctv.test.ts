import assert from "node:assert/strict";
import test from "node:test";
import { buildCctvEstimate } from "./cctv";

test("CCTV estimate includes retention, headroom, and expansion in capacity", () => {
  const result = buildCctvEstimate({
    cameraCount: 8,
    bitrateMbps: 4,
    retentionDays: 30,
    recordingHoursPerDay: 24,
    cameraCountGrowth: 2,
    poeWattsPerCamera: 12
  });

  assert.equal(result.cameraCount, 8);
  assert.equal(result.nvrChannels, 16);
  assert.equal(result.estimatedStorageTB, 12.5);
  assert.equal(result.recordingBandwidthMbps, 37);
  assert.equal(result.poeSwitches24Port, 1);
  assert.equal(result.poeBudgetWatts, 150);
  assert.equal(result.cableEstimate, null);
  assert.equal(result.needsTechnicalReview, true);
});

test("CCTV estimate clamps untrusted raw numeric values defensively", () => {
  const result = buildCctvEstimate({
    cameraCount: 1000,
    bitrateMbps: 100,
    retentionDays: 1000,
    recordingHoursPerDay: 30,
    cameraCountGrowth: 1000,
    poeWattsPerCamera: 100
  });
  assert.equal(result.cameraCount, 256);
  assert.equal(result.nvrChannels, 384);
  assert.ok(result.estimatedStorageTB > 0);
  assert.equal(result.recordingBandwidthMbps, 9421);
});
