import assert from "node:assert/strict";
import test from "node:test";
import { parseByteRange, sniffMediaType } from "./media-validate";

const pad = (head: number[]) => Uint8Array.from([...head, ...new Array(16).fill(0)]);
const text = (value: string) => [...value].map((char) => char.charCodeAt(0));

test("recognizes accepted media from file signatures", () => {
  assert.equal(sniffMediaType(pad([0xff, 0xd8, 0xff])), "image/jpeg");
  assert.equal(sniffMediaType(pad([0x89, ...text("PNG")])), "image/png");
  assert.equal(sniffMediaType(pad(text("GIF89a"))), "image/gif");
  assert.equal(sniffMediaType(pad([...text("RIFF"), 0, 0, 0, 0, ...text("WEBP")])), "image/webp");
  assert.equal(sniffMediaType(pad([0, 0, 0, 24, ...text("ftyp")])), "video/mp4");
  assert.equal(sniffMediaType(pad([0x1a, 0x45, 0xdf, 0xa3])), "video/webm");
});

test("rejects disguised and truncated uploads", () => {
  assert.equal(sniffMediaType(pad(text("<svg onload=alert(1)>"))), null);
  assert.equal(sniffMediaType(pad(text("<!doctype html>"))), null);
  assert.equal(sniffMediaType(new Uint8Array(3)), null);
});

test("byte ranges for video seeking", () => {
  assert.deepEqual(parseByteRange("bytes=0-99", 1000), { start: 0, end: 99 });
  assert.deepEqual(parseByteRange("bytes=900-", 1000), { start: 900, end: 999 });
  assert.deepEqual(parseByteRange("bytes=-100", 1000), { start: 900, end: 999 });
  assert.deepEqual(parseByteRange("bytes=0-5000", 1000), { start: 0, end: 999 });
  assert.equal(parseByteRange("bytes=5000-", 1000), "invalid");
  assert.equal(parseByteRange(null, 1000), null);
  assert.equal(parseByteRange("items=0-1", 1000), null);
});
