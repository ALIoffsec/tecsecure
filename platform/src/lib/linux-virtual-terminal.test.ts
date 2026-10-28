import assert from "node:assert/strict";
import test from "node:test";
import { learningModules } from "./learning-demo";
import { createLinuxVirtualTerminalState, runLinuxVirtualCommand } from "./linux-virtual-terminal";

test("every assigned Linux practice command runs in the browser-only simulator", () => {
  const module = learningModules.find((item) => item.slug === "linux-fundamentals");
  assert.ok(module);

  for (const [sectionIndex, section] of module.sections.entries()) {
    assert.ok(section.terminalPractice, `lesson ${sectionIndex + 1} has terminal tasks`);
    let state = createLinuxVirtualTerminalState();
    for (const item of section.terminalPractice.tasks) {
      const result = runLinuxVirtualCommand(item.command, state);
      assert.equal(result.ok, true, `lesson ${sectionIndex + 1} accepts: ${item.command}\n${result.output}`);
      state = result.state;
    }
  }
});

test("virtual file commands only mutate the in-memory student home", () => {
  let state = createLinuxVirtualTerminalState();
  const madeDirectory = runLinuxVirtualCommand("mkdir /home/student/safe-lab", state);
  assert.equal(madeDirectory.ok, true);
  state = madeDirectory.state;

  const touched = runLinuxVirtualCommand("touch /home/student/safe-lab/note.txt", state);
  assert.equal(touched.ok, true);
  state = touched.state;

  const blockedSystemWrite = runLinuxVirtualCommand("touch /etc/important.conf", state);
  assert.equal(blockedSystemWrite.ok, false);
  assert.equal("/etc/important.conf" in blockedSystemWrite.state.files, false);

  const blockedRecursiveDelete = runLinuxVirtualCommand("rm -rf /", state);
  assert.equal(blockedRecursiveDelete.ok, false);
  assert.equal("/home/student/readme.txt" in blockedRecursiveDelete.state.files, true);
});

test("virtual terminal rejects shell composition and real network destinations", () => {
  const state = createLinuxVirtualTerminalState();
  assert.equal(runLinuxVirtualCommand("pwd; rm -rf /", state).ok, false);
  assert.equal(runLinuxVirtualCommand("cat /var/log/demo.log | grep ERROR", state).ok, false);
  assert.equal(runLinuxVirtualCommand("ping 203.0.113.10", state).ok, false);
  assert.equal(runLinuxVirtualCommand("curl https://example.com", state).ok, false);
  assert.equal(runLinuxVirtualCommand("sudo apt install package", state).ok, false);
});
