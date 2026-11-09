import assert from "node:assert/strict";
import test from "node:test";
import { learningModules } from "./learning-demo";
import { createLinuxVirtualTerminalState, runLinuxVirtualCommand } from "./linux-virtual-terminal";
import { getPracticeCommandCompletion } from "./practice-command-completion";

test("practice command completion uses only the listed commands", () => {
  assert.equal(getPracticeCommandCompletion("un", ["uname -a", "uname -m"]), "uname -");
  assert.equal(getPracticeCommandCompletion("pwd", ["pwd"]), null);
  assert.equal(getPracticeCommandCompletion("unknown", ["pwd"]), null);
  assert.equal(getPracticeCommandCompletion("", ["pwd"]), null);
});

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
  for (const blocked of ["pwd; rm -rf /", "pwd && whoami", "echo $HOME", "cat < /etc/os-release", "echo `id`", "ls &", "cat /var/log/demo.log | rm /home/student/readme.txt", "cat /var/log/demo.log | sh", "ping 203.0.113.10", "curl https://example.com", "sudo apt install package", "sudo rm /home/student/readme.txt", "ssh root@203.0.113.10"]) {
    assert.equal(runLinuxVirtualCommand(blocked, state).ok, false, blocked);
  }
});

test("pipelines run only through text filters and give real results", () => {
  const state = createLinuxVirtualTerminalState();
  assert.equal(runLinuxVirtualCommand("cat /var/log/demo.log | grep ERROR | wc -l", state).output, "3");
  const top = runLinuxVirtualCommand("grep \"Failed password\" /var/log/auth.log | cut -d' ' -f11 | sort | uniq -c | sort -rn | head -5", state);
  assert.equal(top.ok, true, top.output);
  assert.deepEqual(top.output.split("\n").map(row => row.trim()), ["6 203.0.113.7", "3 198.51.100.23", "2 192.0.2.50", "1 203.0.113.99"]);
  assert.equal(runLinuxVirtualCommand("ps aux | grep nginx", state).output.split("\n").length, 2);
  assert.equal(runLinuxVirtualCommand("a | b | c | d | e | f | g", state).ok, false, "more than six stages");
});

test("redirection writes only inside the student home", () => {
  let state = createLinuxVirtualTerminalState();
  state = runLinuxVirtualCommand("echo \"salom\" > /home/student/note.txt", state).state;
  state = runLinuxVirtualCommand("echo \"yana\" >> /home/student/note.txt", state).state;
  assert.equal(state.files["/home/student/note.txt"], "salom\nyana\n");
  const overwrite = runLinuxVirtualCommand("echo \"faqat\" > /home/student/note.txt", state);
  assert.equal(overwrite.state.files["/home/student/note.txt"], "faqat\n");
  for (const blocked of ["echo x > /etc/passwd", "echo x > /home/student/../../etc/os-release", "echo x > /home/student/Documents", "echo x > a > b", "echo x > a | grep x"]) {
    const result = runLinuxVirtualCommand(blocked, state);
    assert.equal(result.ok, false, blocked);
  }
  assert.equal(runLinuxVirtualCommand("echo x > /etc/passwd", state).state.files["/etc/passwd"], undefined);
  assert.equal(runLinuxVirtualCommand("echo \"a > b\"", state).output, "a > b", "quoted > is text");
});

test("sudo, chown and kill stay inside the sandbox", () => {
  let state = createLinuxVirtualTerminalState();
  assert.equal(runLinuxVirtualCommand("chown root /home/student/readme.txt", state).ok, false);
  assert.equal(runLinuxVirtualCommand("sudo chown root /etc/os-release", state).ok, false);
  state = runLinuxVirtualCommand("sudo chown student:staff /home/student/readme.txt", state).state;
  assert.match(runLinuxVirtualCommand("ls -l /home/student/readme.txt", state).output, / student staff /);
  assert.equal(runLinuxVirtualCommand("kill 1", state).ok, false, "root's process");
  assert.equal(runLinuxVirtualCommand("kill 412", state).ok, false, "own shell");
  assert.equal(runLinuxVirtualCommand("kill 99999", state).ok, false);
  state = runLinuxVirtualCommand("kill -9 640", state).state;
  assert.doesNotMatch(runLinuxVirtualCommand("ps aux", state).output, /report\.py/);
  assert.equal(runLinuxVirtualCommand("kill 640", state).ok, false, "already stopped");
  assert.equal(runLinuxVirtualCommand("mv /etc/os-release /home/student/os.txt", state).ok, false, "system files are not moved");
});

test("archives, history and symbolic modes are virtual but faithful", () => {
  let state = createLinuxVirtualTerminalState();
  state = runLinuxVirtualCommand("mkdir -p /home/student/lab/2026", state).state;
  state = runLinuxVirtualCommand("touch /home/student/lab/2026/a.txt", state).state;
  state = runLinuxVirtualCommand("tar -czf /home/student/lab.tar.gz /home/student/lab", state).state;
  assert.equal(runLinuxVirtualCommand("tar -tzf /home/student/lab.tar.gz", state).output, "lab/\nlab/2026/\nlab/2026/a.txt");
  assert.match(runLinuxVirtualCommand("file /home/student/lab.tar.gz", state).output, /gzip/);
  assert.equal(runLinuxVirtualCommand("tar -czf /tmp/x.tar.gz /home/student/lab", state).ok, false);
  assert.equal(runLinuxVirtualCommand("tar -xzf /home/student/lab.tar.gz", state).ok, false);
  state = runLinuxVirtualCommand("chmod u+x /home/student/readme.txt", state).state;
  assert.equal(state.modes["/home/student/readme.txt"], "744");
  state = runLinuxVirtualCommand("chmod go-r /home/student/readme.txt", state).state;
  assert.equal(state.modes["/home/student/readme.txt"], "700");
  assert.match(runLinuxVirtualCommand("history", state).output, /tar -czf/);
  const moved = runLinuxVirtualCommand("cd /tmp", state).state;
  assert.equal(runLinuxVirtualCommand("cd -", moved).state.cwd, "/home/student");
});
