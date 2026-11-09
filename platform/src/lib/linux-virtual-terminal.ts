export type LinuxVirtualTerminalState = {
  cwd: string;
  directories: string[];
  files: Record<string, string>;
  modes: Record<string, string>;
  /** "user group" for files whose owner was changed with `sudo chown`; everything else belongs to student. */
  owners?: Record<string, string>;
  oldCwd?: string;
  history?: string[];
  /** PIDs of virtual processes the learner stopped with `kill`. */
  killed?: number[];
};

export type LinuxVirtualCommandResult = {
  state: LinuxVirtualTerminalState;
  output: string;
  command: string;
  ok: boolean;
};

const HOME = "/home/student";
const TAR_MARK = "TAR-VIRTUAL-ARCHIVE\n";

const demoLog = [
  "2026-03-14T09:10:02Z INFO api-demo started",
  "2026-03-14T09:11:18Z WARN queue depth=72",
  "2026-03-14T09:12:41Z ERROR cache write failed",
  "2026-03-14T09:12:42Z ERROR request returned 503",
  "2026-03-14T09:13:01Z INFO worker recovered",
  "2026-03-14T09:14:11Z ERROR retry limit reached"
].join("\n");

// Field 11 (split on single spaces) of every "Failed password" line is the attacker's address,
// so the pipeline from the lesson prints them. All addresses are from documentation ranges.
const authLog = [
  ["09:10:02", 315, "Server listening on 0.0.0.0 port 22."],
  ["09:11:02", 422, "Accepted publickey for student from 192.0.2.10 port 50122 ssh2"],
  ...[1, 2, 3, 4, 5, 6].map(n => [`09:12:${String(10 + n).padStart(2, "0")}`, 430 + n, `Failed password for root from 203.0.113.7 port ${52100 + n} ssh2`]),
  ...[1, 2, 3].map(n => [`09:13:${String(20 + n).padStart(2, "0")}`, 440 + n, `Failed password for root from 198.51.100.23 port ${53100 + n} ssh2`]),
  ...[1, 2].map(n => [`09:14:${String(30 + n).padStart(2, "0")}`, 450 + n, `Failed password for student from 192.0.2.50 port ${54100 + n} ssh2`]),
  ["09:15:01", 460, "Failed password for root from 203.0.113.99 port 55001 ssh2"],
  ["09:15:40", 461, "Accepted publickey for student from 192.0.2.10 port 50140 ssh2"]
].map(([time, pid, text]) => `Mar 14 ${time} sandbox sshd[${pid}]: ${text}`).join("\n");

type VirtualProcess = { user: string; pid: number; cpu: string; mem: string; command: string };
const processes: VirtualProcess[] = [
  { user: "root", pid: 1, cpu: "0.0", mem: "0.1", command: "/sbin/init (systemd)" },
  { user: "root", pid: 315, cpu: "0.0", mem: "0.2", command: "sshd: /usr/sbin/sshd -D" },
  { user: "root", pid: 520, cpu: "0.0", mem: "0.3", command: "nginx: master process /usr/sbin/nginx" },
  { user: "www-data", pid: 521, cpu: "0.3", mem: "0.6", command: "nginx: worker process" },
  { user: "student", pid: 412, cpu: "0.1", mem: "0.4", command: "-bash" },
  { user: "student", pid: 591, cpu: "0.0", mem: "0.1", command: "python3 app.py" },
  { user: "student", pid: 640, cpu: "97.5", mem: "1.2", command: "python3 report.py" }
];

const services: Record<string, string> = {
  ssh: "● ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n     Active: active (running) since Sat 2026-03-14 08:00:00 UTC\n   Main PID: 315 (sshd)\n      Tasks: 1",
  nginx: "● nginx.service - A high performance web server and a reverse proxy server\n     Loaded: loaded (/lib/systemd/system/nginx.service; enabled)\n     Active: active (running) since Sat 2026-03-14 08:00:05 UTC\n   Main PID: 520 (nginx)\n      Tasks: 2",
  cron: "● cron.service - Regular background program processing daemon\n     Loaded: loaded (/lib/systemd/system/cron.service; enabled)\n     Active: active (running) since Sat 2026-03-14 08:00:02 UTC\n   Main PID: 301 (cron)"
};

const journals: Record<string, string[]> = {
  ssh: [
    "Mar 14 09:10:02 sandbox sshd[315]: Server listening on 0.0.0.0 port 22",
    "Mar 14 09:11:02 sandbox sshd[422]: Accepted publickey for student from 192.0.2.10",
    "Mar 14 09:12:44 sandbox sshd[428]: Failed password for invalid user demo from 192.0.2.50",
    "Mar 14 09:13:01 sandbox sshd[315]: Connection closed by 192.0.2.50",
    "Mar 14 09:14:11 sandbox sshd[315]: Server ready"
  ],
  nginx: [
    "Mar 14 08:00:05 sandbox systemd[1]: Started nginx.service - A high performance web server.",
    "Mar 14 09:12:40 sandbox nginx[521]: upstream timed out while reading response header from upstream",
    "Mar 14 09:12:42 sandbox nginx[521]: 502 Bad Gateway returned for GET /api/status"
  ],
  boot: [
    "Mar 14 08:00:00 sandbox kernel: Linux version 6.8.0-virtual (x86_64)",
    "Mar 14 08:00:00 sandbox kernel: Command line: BOOT_IMAGE=/boot/vmlinuz-6.8.0-virtual root=/dev/vda1 ro",
    "Mar 14 08:00:01 sandbox kernel: EXT4-fs (vda1): mounted filesystem",
    "Mar 14 08:00:01 sandbox systemd[1]: systemd 255 running in system mode",
    "Mar 14 08:00:02 sandbox systemd[1]: Started cron.service - Regular background program processing daemon.",
    "Mar 14 08:00:03 sandbox systemd[1]: Started ssh.service - OpenBSD Secure Shell server.",
    "Mar 14 08:00:05 sandbox systemd[1]: Started nginx.service - A high performance web server.",
    "Mar 14 08:00:06 sandbox systemd[1]: Reached target multi-user.target - Multi-User System."
  ]
};

export function createLinuxVirtualTerminalState(): LinuxVirtualTerminalState {
  return {
    cwd: HOME,
    directories: [
      "/", "/etc", "/etc/nginx", "/etc/ssh", "/home", HOME, `${HOME}/Documents`,
      `${HOME}/.config`, "/tmp", "/var", "/var/log"
    ],
    files: {
      "/etc/os-release": "NAME=\"Ubuntu\"\nVERSION=\"24.04 LTS (Noble Numbat)\"\nID=ubuntu\nVERSION_ID=\"24.04\"\nPRETTY_NAME=\"Ubuntu 24.04 LTS\"\n",
      "/etc/hostname": "sandbox\n",
      "/etc/nginx/nginx.conf": "user www-data;\nworker_processes auto;\nevents { worker_connections 768; }\n",
      "/etc/ssh/sshd_config": "Port 22\nPermitRootLogin no\nPasswordAuthentication no\n",
      [`${HOME}/readme.txt`]: "Linux laboratoriyasiga xush kelibsiz.\nBuyruqlar faqat virtual muhitda bajariladi.\n",
      [`${HOME}/.profile`]: "EDITOR=nano\n",
      [`${HOME}/users.txt`]: "ali\nali\nbek\nnodir\n",
      [`${HOME}/passwd.txt`]: "root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:Student:/home/student:/bin/bash\n",
      "/var/log/demo.log": demoLog,
      "/var/log/auth.log": `${authLog}\n`,
      "/var/log/auth-demo.log": "Mar 14 09:11:02 sshd: Accepted publickey for student\nMar 14 09:12:44 sshd: Failed password for invalid user demo\n"
    },
    modes: {
      [`${HOME}/readme.txt`]: "644",
      [`${HOME}/.profile`]: "600",
      [`${HOME}/users.txt`]: "644",
      [`${HOME}/passwd.txt`]: "644",
      [`${HOME}/lab/cleanup.tmp`]: "600",
      "/var/log/demo.log": "640",
      "/var/log/auth.log": "640",
      "/var/log/auth-demo.log": "640"
    }
  };
}

function cloneState(state: LinuxVirtualTerminalState): LinuxVirtualTerminalState {
  return {
    cwd: state.cwd,
    directories: [...state.directories],
    files: { ...state.files },
    modes: { ...state.modes },
    owners: { ...(state.owners ?? {}) },
    oldCwd: state.oldCwd,
    history: [...(state.history ?? [])],
    killed: [...(state.killed ?? [])]
  };
}

function resolvePath(cwd: string, value: string): string {
  const expanded = value === "~" ? HOME : value.startsWith("~/") ? `${HOME}/${value.slice(2)}` : value;
  const segments = (expanded.startsWith("/") ? expanded : `${cwd}/${expanded}`).split("/");
  const resolved: string[] = [];
  for (const segment of segments) {
    if (!segment || segment === ".") continue;
    if (segment === "..") resolved.pop();
    else resolved.push(segment);
  }
  return `/${resolved.join("/")}`;
}

/** Shell-like words: quotes group text and may sit inside a word (`-d' '` is "-d "). */
function tokenize(input: string): string[] {
  const words: string[] = [];
  let current = "";
  let quote: string | null = null;
  let started = false;
  for (const char of input) {
    if (quote) {
      if (char === quote) quote = null;
      else current += char;
    } else if (char === "'" || char === "\"") {
      quote = char;
      started = true;
    } else if (/\s/.test(char)) {
      if (started) { words.push(current); current = ""; started = false; }
    } else {
      current += char;
      started = true;
    }
  }
  if (started) words.push(current);
  return words;
}

/** Splits on `|` and finds one trailing `>`/`>>`, both only outside quotes. Null when they appear anywhere else. */
function splitShell(input: string): { stages: string[]; redirect: { append: boolean; target: string } | null } | null {
  const stages: string[] = [];
  let current = "";
  let quote: string | null = null;
  let redirect: { append: boolean; target: string } | null = null;
  for (let index = 0; index < input.length; index++) {
    const char = input[index];
    if (quote) {
      if (char === quote) quote = null;
      current += char;
      continue;
    }
    if (char === "'" || char === "\"") { quote = char; current += char; continue; }
    if (char === "|") { stages.push(current); current = ""; continue; }
    if (char === ">") {
      const append = input[index + 1] === ">";
      const rest = input.slice(index + (append ? 2 : 1));
      if (/[|>]/.test(rest.replace(/"[^"]*"|'[^']*'/g, ""))) return null;
      const target = tokenize(rest);
      if (target.length !== 1) return null;
      redirect = { append, target: target[0] };
      break;
    }
    current += char;
  }
  if (quote) return null;
  stages.push(current);
  return stages.some(stage => !stage.trim()) ? null : { stages, redirect };
}

function isDirectory(path: string, state: LinuxVirtualTerminalState): boolean {
  return state.directories.includes(path);
}

function isFile(path: string, state: LinuxVirtualTerminalState): boolean {
  return Object.prototype.hasOwnProperty.call(state.files, path);
}

function isHomePath(path: string): boolean {
  return path === HOME || path.startsWith(`${HOME}/`);
}

function requireFile(path: string, state: LinuxVirtualTerminalState): string | undefined {
  return isFile(path, state) ? state.files[path] : undefined;
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).at(-1) ?? "/";
}

function parentOf(path: string): string {
  return path.slice(0, path.lastIndexOf("/")) || "/";
}

function permissionText(mode: string): string {
  return mode.split("").map((digit) => {
    const value = Number(digit);
    return `${value & 4 ? "r" : "-"}${value & 2 ? "w" : "-"}${value & 1 ? "x" : "-"}`;
  }).join("");
}

function ownerOf(path: string, state: LinuxVirtualTerminalState): [string, string] {
  const owner = state.owners?.[path];
  if (owner) return owner.split(" ") as [string, string];
  return path.startsWith("/var/log") || path.startsWith("/etc") ? ["root", "root"] : ["student", "student"];
}

/** `chmod u+x`, `g-w`, `o=r`, `a+r` applied to a three-digit mode. */
function symbolicMode(mode: string, spec: string): string | null {
  const match = spec.match(/^([ugoa]*)([+\-=])([rwx]+)$/);
  if (!match) return null;
  const who = match[1] || "a";
  const bits = [...match[3]].reduce((sum, letter) => sum + (letter === "r" ? 4 : letter === "w" ? 2 : 1), 0);
  const digits = mode.split("").map(Number);
  ["u", "g", "o"].forEach((role, index) => {
    if (!who.includes(role) && !who.includes("a")) return;
    digits[index] = match[2] === "+" ? digits[index] | bits : match[2] === "-" ? digits[index] & ~bits : bits;
  });
  return digits.join("");
}

function listDirectory(path: string, state: LinuxVirtualTerminalState, showHidden: boolean): string[] {
  const prefix = path === "/" ? "/" : `${path}/`;
  const children = new Set<string>();
  for (const entry of [...state.directories, ...Object.keys(state.files)]) {
    if (!entry.startsWith(prefix) || entry === path) continue;
    const remainder = entry.slice(prefix.length);
    const child = remainder.split("/")[0];
    if (child && (showHidden || !child.startsWith("."))) children.add(child);
  }
  return [...children].sort((a, b) => a.localeCompare(b));
}

function lines(content: string): string[] {
  return content.split("\n").filter((line, index, all) => line || index < all.length - 1);
}

function failure(state: LinuxVirtualTerminalState, command: string, output: string): LinuxVirtualCommandResult {
  return { state, output, command, ok: false };
}

function success(state: LinuxVirtualTerminalState, command: string, output: string): LinuxVirtualCommandResult {
  return { state, output, command, ok: true };
}

/** Commands that may read the previous command's output in a pipeline. */
const filters = new Set(["grep", "cut", "sort", "uniq", "head", "tail", "wc"]);

const HELP = [
  "Ruxsat etilgan o‘quv buyruqlari:",
  "pwd ls cd find mkdir touch cat less file echo cp mv rm chmod stat tar history",
  "uname hostnamectl whoami id groups ps top kill systemctl journalctl ip ss ping curl df free",
  "grep head tail wc sort uniq cut date apt man sudo -l, sudo chown",
  "",
  "`|` faqat matn filtrlari bilan (grep, cut, sort, uniq, head, tail, wc); `>` va `>>` faqat /home/student ichiga yozadi.",
  "Haqiqiy shell, paket o‘rnatish, tarmoq so‘rovi va tizimni o‘zgartirish ishlamaydi."
].join("\n");

/** One simple command. `stdin` is the previous pipeline stage's output, when there is one. */
function runOne(input: string, state: LinuxVirtualTerminalState, stdin?: string): LinuxVirtualCommandResult {
  const tokens = tokenize(input.trim());
  const command = tokens[0]?.toLowerCase() ?? "";
  const args = tokens.slice(1);
  const pathAt = (value: string) => resolvePath(state.cwd, value);
  const flags = args.filter(arg => arg.startsWith("-"));
  const operands = args.filter(arg => !arg.startsWith("-"));
  /** The file named at `position` among operands, or the piped input when there is no such operand. */
  const readSource = (position: number): string | undefined => {
    const target = operands[position];
    if (target !== undefined) return requireFile(pathAt(target), state);
    return stdin;
  };

  switch (command) {
    case "help":
      return success(state, command, HELP);
    case "pwd":
      return success(state, command, state.cwd);
    case "whoami":
      return success(state, command, "student");
    case "id":
      return success(state, command, "uid=1000(student) gid=1000(student) groups=1000(student),27(sudo)");
    case "groups":
      return success(state, command, "student sudo");
    case "uname":
      if (args.includes("-m")) return success(state, command, "x86_64");
      if (args.includes("-r")) return success(state, command, "6.8.0-virtual");
      return success(state, command, "Linux sandbox 6.8.0-virtual #1 SMP x86_64 GNU/Linux");
    case "hostnamectl":
      return success(state, command, " Static hostname: sandbox\n       Icon name: computer-vm\n         Chassis: vm\nOperating System: Ubuntu 24.04 LTS\n          Kernel: Linux 6.8.0-virtual\n    Architecture: x86-64");
    case "date":
      return success(state, command, args.includes("-Is") ? "2026-03-14T09:15:00Z" : "Sat Mar 14 09:15:00 UTC 2026");
    case "history":
      return success(state, command, (state.history ?? []).map((line, index) => `${String(index + 1).padStart(5)}  ${line}`).join("\n"));
    case "echo":
      return success(state, command, args.join(" "));
    case "ls": {
      const target = operands.at(-1) ?? ".";
      const long = flags.some(flag => flag.includes("l"));
      const path = pathAt(target);
      const row = (childPath: string, name: string) => {
        const directory = isDirectory(childPath, state);
        const mode = state.modes[childPath] ?? (directory ? "755" : "644");
        const [user, group] = ownerOf(childPath, state);
        return `${directory ? "d" : "-"}${permissionText(mode)} ${user} ${group} ${state.files[childPath]?.length ?? 4096} Mar 14 09:10 ${name}`;
      };
      if (isFile(path, state)) return success(state, command, long ? row(path, basename(path)) : basename(path));
      if (!isDirectory(path, state)) return failure(state, command, `ls: '${target}': bunday yo‘l topilmadi`);
      const rows = listDirectory(path, state, flags.some(flag => flag.includes("a")));
      if (!long) return success(state, command, rows.join("  ") || "(bo‘sh katalog)");
      return success(state, command, rows.map(name => row(path === "/" ? `/${name}` : `${path}/${name}`, name)).join("\n") || "total 0");
    }
    case "cd": {
      const target = args[0] ?? HOME;
      if (target === "-") {
        if (!state.oldCwd) return failure(state, command, "cd: oldingi katalog hali yo‘q");
        [state.cwd, state.oldCwd] = [state.oldCwd, state.cwd];
        return success(state, command, state.cwd);
      }
      const path = pathAt(target);
      if (!isDirectory(path, state)) return failure(state, command, `cd: '${target}': katalog topilmadi`);
      state.oldCwd = state.cwd;
      state.cwd = path;
      return success(state, command, "");
    }
    case "find": {
      const rootArg = args[0] && !args[0].startsWith("-") ? args[0] : ".";
      const root = pathAt(rootArg);
      if (!isDirectory(root, state)) return failure(state, command, `find: '${rootArg}': katalog topilmadi`);
      const nameIndex = args.indexOf("-name");
      const pattern = nameIndex >= 0 ? args[nameIndex + 1] : undefined;
      const entries = [...state.directories, ...Object.keys(state.files)].filter((entry) => entry === root || entry.startsWith(`${root}/`));
      const matches = entries.filter((entry) => {
        if (!pattern) return true;
        const name = basename(entry);
        return pattern.startsWith("*.") ? name.endsWith(pattern.slice(1)) : name === pattern;
      });
      return success(state, command, matches.sort().join("\n") || "Mos fayl topilmadi.");
    }
    case "mkdir": {
      const target = operands.at(-1);
      if (!target) return failure(state, command, "Foydalanish: mkdir [-p] [yo‘l]");
      const path = pathAt(target);
      if (!isHomePath(path)) return failure(state, command, "Faqat /home/student ichida virtual katalog yaratish mumkin.");
      const recursive = flags.includes("-p");
      if (!isDirectory(parentOf(path), state) && !recursive) return failure(state, command, `mkdir: ota katalog yo‘q: ${parentOf(path)}`);
      if (isDirectory(path, state)) return recursive ? success(state, command, "") : failure(state, command, `mkdir: katalog mavjud: ${path}`);
      if (recursive) {
        let current = "";
        for (const part of path.split("/").filter(Boolean)) {
          current += `/${part}`;
          if (!state.directories.includes(current)) state.directories.push(current);
        }
      } else {
        state.directories.push(path);
      }
      return success(state, command, "");
    }
    case "touch": {
      const target = operands[0];
      if (!target) return failure(state, command, "Foydalanish: touch [fayl]");
      const path = pathAt(target);
      if (!isHomePath(path)) return failure(state, command, "Faqat /home/student ichida virtual fayl yaratish mumkin.");
      if (!isDirectory(parentOf(path), state)) return failure(state, command, "Ota katalog avval yaratilishi kerak.");
      state.files[path] ??= "";
      state.modes[path] ??= "644";
      return success(state, command, "");
    }
    case "cat":
    case "less": {
      const content = operands[0] ? requireFile(pathAt(operands[0]), state) : undefined;
      if (content === undefined) return failure(state, command, `${command}: '${operands[0] ?? ""}': fayl topilmadi`);
      return success(state, command, command === "less"
        ? `${content.trimEnd()}\n(END) — haqiqiy less’da matn sahifalab ko‘rsatiladi, / bilan qidiriladi, q bilan chiqiladi.`
        : content.trimEnd());
    }
    case "file": {
      const target = operands[0];
      if (!target) return failure(state, command, "Foydalanish: file [yo‘l]");
      const path = pathAt(target);
      if (isDirectory(path, state)) return success(state, command, `${target}: directory`);
      const content = requireFile(path, state);
      if (content === undefined) return failure(state, command, `file: '${target}': topilmadi`);
      const kind = content.startsWith(TAR_MARK) ? "gzip compressed data (virtual tar arxivi)"
        : !content ? "empty"
          : /^[\x00-\x7f]*$/.test(content) ? "ASCII text" : "UTF-8 Unicode text";
      return success(state, command, `${target}: ${kind}`);
    }
    case "cp":
    case "mv": {
      const [sourceArg, targetArg] = operands;
      if (!sourceArg || !targetArg) return failure(state, command, `Foydalanish: ${command} [-i] [manba] [manzil]`);
      const source = pathAt(sourceArg);
      let destination = pathAt(targetArg);
      if (isDirectory(source, state)) return failure(state, command, "Simulyatorda faqat fayllar nusxalanadi yoki ko‘chiriladi.");
      const content = requireFile(source, state);
      if (content === undefined) return failure(state, command, `${command}: manba fayl topilmadi: ${sourceArg}`);
      if (isDirectory(destination, state)) destination = `${destination}/${basename(source)}`;
      if (!isHomePath(destination)) return failure(state, command, "Fayl faqat /home/student ichida nusxalanishi yoki ko‘chirilishi mumkin.");
      if (!isDirectory(parentOf(destination), state)) return failure(state, command, "Manzil katalogi topilmadi.");
      if (command === "mv" && !isHomePath(source)) return failure(state, command, "Tizim fayllarini ko‘chirish taqiqlangan; nusxasini oling (cp).");
      state.files[destination] = content;
      state.modes[destination] = state.modes[source] ?? "644";
      if (command === "mv") {
        delete state.files[source];
        delete state.modes[source];
      }
      return success(state, command, "");
    }
    case "rm": {
      const target = operands[0];
      if (!target || flags.some((flag) => flag.includes("r") || flag === "--recursive")) {
        return failure(state, command, "Simulyator faqat bitta virtual faylni o‘chiradi; katalog va rekursiv o‘chirish taqiqlangan.");
      }
      const path = pathAt(target);
      if (!isHomePath(path)) return failure(state, command, "Tizim yo‘llarini o‘chirish taqiqlangan; faqat /home/student ichida ishlang.");
      if (!isFile(path, state)) return failure(state, command, `rm: virtual fayl topilmadi: ${target}`);
      delete state.files[path];
      delete state.modes[path];
      return success(state, command, "");
    }
    case "chmod": {
      const [mode, target] = args;
      if (!mode || !target) return failure(state, command, "Foydalanish: chmod 640 /home/student/fayl yoki chmod u+x /home/student/fayl");
      const path = pathAt(target);
      if (!isHomePath(path) || !isFile(path, state)) return failure(state, command, "chmod faqat mavjud virtual o‘quvchi fayllariga qo‘llanadi.");
      const next = /^[0-7]{3}$/.test(mode) ? mode : symbolicMode(state.modes[path] ?? "644", mode);
      if (!next) return failure(state, command, "Rejim 640 kabi uch raqam yoki u+x, g-w, o=r kabi yozuv bo‘lsin.");
      state.modes[path] = next;
      return success(state, command, "");
    }
    case "chown":
      return failure(state, command, `chown: '${operands.at(-1) ?? ""}' egasini o‘zgartirib bo‘lmadi: Operation not permitted\nEgani faqat root o‘zgartiradi: sudo chown user:group fayl`);
    case "sudo": {
      if (args[0] === "-l") return success(state, command, "User student may run the following commands on sandbox:\n    (root) /usr/bin/chown\n    (root) /usr/bin/systemctl status *");
      if (args[0] !== "chown") return failure(state, command, "Simulyatorda sudo faqat `sudo -l` va `sudo chown` uchun ishlaydi. Haqiqiy serverda sudo har bir amalni jurnalga yozadi.");
      const [owner, target] = args.slice(1).filter(arg => !arg.startsWith("-"));
      const match = owner?.match(/^(student|root|www-data)(?::(student|root|www-data|staff|sudo))?$/);
      if (!match || !target) return failure(state, command, "Foydalanish: sudo chown student:staff /home/student/fayl (foydalanuvchilar: student, root, www-data)");
      const path = pathAt(target);
      if (!isHomePath(path) || !isFile(path, state)) return failure(state, command, "Simulyatorda chown faqat /home/student ichidagi virtual fayllarga qo‘llanadi.");
      state.owners = { ...(state.owners ?? {}), [path]: `${match[1]} ${match[2] ?? ownerOf(path, state)[1]}` };
      return success(state, command, "");
    }
    case "stat": {
      const target = operands[0];
      const path = target ? pathAt(target) : "";
      const content = requireFile(path, state);
      if (content === undefined) return failure(state, command, `stat: '${target ?? ""}': virtual fayl topilmadi`);
      const mode = state.modes[path] ?? "644";
      const [user, group] = ownerOf(path, state);
      return success(state, command, `  File: ${path}\n  Size: ${content.length}\tBlocks: 8\tIO Block: 4096 regular file\nAccess: (0${mode}/-${permissionText(mode)})  Uid: (${user === "root" ? 0 : user === "www-data" ? 33 : 1000}/${user}) Gid: (${group === "root" ? 0 : 1000}/${group})`);
    }
    case "ps": {
      const alive = processes.filter(process => !(state.killed ?? []).includes(process.pid));
      return success(state, command, ["USER       PID %CPU %MEM COMMAND", ...alive.map(p => `${p.user.padEnd(9)} ${String(p.pid).padStart(4)} ${p.cpu.padStart(4)} ${p.mem.padStart(4)} ${p.command}`)].join("\n"));
    }
    case "top": {
      const busy = !(state.killed ?? []).includes(640);
      return success(state, command, [
        `top - 09:15:00 up 2 days, 3 users, load average: ${busy ? "1.08, 0.74, 0.40" : "0.12, 0.31, 0.30"}`,
        "Tasks: 87 total, 1 running, 86 sleeping",
        `%Cpu(s): ${busy ? "48.6 us, 1.2 sy, 50.0 id" : "2.0 us, 1.0 sy, 97.0 id"}`,
        "MiB Mem: 4096.0 total, 2150.0 free",
        "  PID USER      %CPU COMMAND",
        ...(busy ? ["  640 student   97.5 python3 report.py"] : []),
        "  521 www-data   0.3 nginx: worker process",
        "  412 student    0.1 bash"
      ].join("\n"));
    }
    case "kill": {
      const pidArg = operands.at(-1);
      const signal = flags.find(flag => /^-(9|15|KILL|TERM)$/i.test(flag)) ?? "-15";
      if (!pidArg || !/^\d+$/.test(pidArg) || flags.some(flag => !/^-(9|15|KILL|TERM)$/i.test(flag))) return failure(state, command, "Foydalanish: kill PID (SIGTERM) yoki kill -9 PID (SIGKILL)");
      const target = processes.find(process => process.pid === Number(pidArg) && !(state.killed ?? []).includes(process.pid));
      if (!target) return failure(state, command, `kill: (${pidArg}) - No such process`);
      if (target.user !== "student") return failure(state, command, `kill: (${pidArg}) - Operation not permitted\nBu jarayon ${target.user} foydalanuvchisiga tegishli.`);
      if (target.pid === 412) return failure(state, command, "Bu sizning joriy shell’ingiz; simulyatorda uni yopib bo‘lmaydi.");
      state.killed = [...(state.killed ?? []), target.pid];
      const hard = /^-(9|KILL)$/i.test(signal);
      return success(state, command, `[virtual] ${target.pid} (${target.command}) jarayoniga ${hard ? "SIGKILL (9) yuborildi: majburan to‘xtatildi" : "SIGTERM (15) yuborildi: ishini saqlab yopildi"}.`);
    }
    case "systemctl": {
      if (args[0] !== "status") return failure(state, command, "Faqat o‘qish uchun `systemctl status <xizmat>` ruxsat etilgan. restart/stop haqiqiy serverda bajariladi.");
      const unit = (args[1] ?? "ssh").replace(/\.service$/, "");
      return services[unit] ? success(state, command, services[unit]) : failure(state, command, `Unit ${unit}.service could not be found.`);
    }
    case "journalctl": {
      const unitIndex = args.indexOf("-u");
      const unit = unitIndex >= 0 ? args[unitIndex + 1]?.replace(/\.service$/, "") : undefined;
      const countIndex = args.indexOf("-n");
      const count = countIndex >= 0 ? Math.min(50, Math.max(1, Number(args[countIndex + 1]) || 10)) : undefined;
      let rows = args.includes("-b") ? journals.boot : unit ? journals[unit] : [...journals.boot.slice(-2), ...journals.ssh];
      if (!rows) return failure(state, command, `-- No entries -- (${unit} xizmati uchun yozuv yo‘q)`);
      if (args.includes("--since")) rows = rows.slice(-3);
      if (count) rows = rows.slice(-count);
      return success(state, command, rows.join("\n"));
    }
    case "ip":
      if (args[0] === "route" || args[0] === "r") return success(state, command, "default via 192.0.2.1 dev eth0\n192.0.2.0/24 dev eth0 proto kernel scope link src 192.0.2.25");
      if (args[0] === "addr" || args[0] === "address" || args[0] === "a") return success(state, command, "1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\n    inet 192.0.2.25/24 scope global eth0");
      return failure(state, command, "Foydalanish: ip addr yoki ip route");
    case "ss":
      return success(state, command, "Netid State  Recv-Q Send-Q Local Address:Port  Peer Address:Port\nudp   UNCONN 0      0      127.0.0.53%lo:53    0.0.0.0:*\ntcp   LISTEN 0      128    0.0.0.0:22          0.0.0.0:*\ntcp   LISTEN 0      511    0.0.0.0:80          0.0.0.0:*\ntcp   LISTEN 0      511    0.0.0.0:443         0.0.0.0:*\ntcp   LISTEN 0      244    127.0.0.1:5432      0.0.0.0:*");
    case "ssh":
      return failure(state, command, "ssh haqiqiy serverga shifrlangan ulanish ochadi; o‘quv simulyatori tarmoqqa chiqmaydi.\nHaqiqiy serverda: ssh student@server.example.test\nKalit bilan: ssh-keygen -t ed25519, so‘ng ssh-copy-id student@server.example.test");
    case "nano":
    case "vim":
    case "vi":
      return failure(state, command, `${command} — interaktiv matn muharriri; simulyatorda ochilmaydi.\nnano’da Ctrl+O saqlaydi, Ctrl+X chiqadi. Bu yerda faylga yozish uchun: echo "matn" >> fayl`);
    case "tar": {
      const mode = (args[0] ?? "").replace(/^-/, "");
      const archiveArg = args[1];
      if (!/^[cxtvzf]+$/.test(mode) || !mode.includes("f") || !archiveArg) return failure(state, command, "Foydalanish: tar -czf arxiv.tar.gz katalog/ yoki tar -tzf arxiv.tar.gz");
      const archive = pathAt(archiveArg);
      if (mode.includes("x")) return failure(state, command, "Simulyatorda arxivni ochish (-x) yo‘q; ichini -t bilan ko‘ring.");
      if (mode.includes("t")) {
        const content = requireFile(archive, state);
        if (content === undefined || !content.startsWith(TAR_MARK)) return failure(state, command, `tar: ${archiveArg}: virtual arxiv topilmadi`);
        return success(state, command, content.slice(TAR_MARK.length).trimEnd());
      }
      if (!mode.includes("c")) return failure(state, command, "tar: -c (yaratish) yoki -t (ro‘yxat) kerak");
      const sourceArg = args[2];
      const source = sourceArg ? pathAt(sourceArg) : "";
      if (!sourceArg || !isHomePath(source) || !(isDirectory(source, state) || isFile(source, state))) return failure(state, command, "tar: arxivlanadigan katalog /home/student ichida bo‘lishi kerak");
      if (!isHomePath(archive) || !isDirectory(parentOf(archive), state)) return failure(state, command, "tar: arxiv faqat /home/student ichida yaratiladi");
      const base = parentOf(source);
      const entries = [...state.directories, ...Object.keys(state.files)]
        .filter(entry => entry === source || entry.startsWith(`${source}/`))
        .sort()
        .map(entry => `${entry.slice(base === "/" ? 1 : base.length + 1)}${isDirectory(entry, state) ? "/" : ""}`);
      state.files[archive] = `${TAR_MARK}${entries.join("\n")}\n`;
      state.modes[archive] = "644";
      return success(state, command, mode.includes("v") ? entries.join("\n") : "");
    }
    case "ping":
      if (!args.includes("example.test")) return failure(state, command, "Faqat hujjatlar uchun ajratilgan example.test nomi simulyatsiya qilinadi; tarmoqqa paket yuborilmaydi.");
      return success(state, command, "PING example.test (192.0.2.80): simulated\n64 bytes from 192.0.2.80: icmp_seq=1 ttl=64 time=1.2 ms\n64 bytes from 192.0.2.80: icmp_seq=2 ttl=64 time=1.0 ms\n64 bytes from 192.0.2.80: icmp_seq=3 ttl=64 time=1.1 ms\n--- example.test ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss (simulated)");
    case "curl":
      if (!args.includes("https://example.test")) return failure(state, command, "Faqat https://example.test uchun oldindan tayyorlangan javob mavjud; internet so‘rovi yuborilmaydi.");
      return success(state, command, "HTTP/2 200\ncontent-type: text/plain; charset=utf-8\nserver: linux-course-simulator\nx-demo: simulated-response");
    case "df":
      return success(state, command, "Filesystem     Type  Size  Used Avail Use% Mounted on\n/dev/vda1      ext4   20G   8G   11G  43% /\n/dev/vdb1      xfs   40G   12G  28G  30% /home");
    case "free":
      return success(state, command, "               total        used        free      shared  buff/cache   available\nMem:            4.0Gi       1.1Gi       2.1Gi       120Mi       800Mi       2.6Gi\nSwap:           1.0Gi          0B       1.0Gi");
    case "grep": {
      const pattern = operands[0];
      const content = readSource(1);
      if (!pattern || content === undefined) return failure(state, command, "Foydalanish: grep [-i] [-v] [-c] MATN /virtual/fayl");
      const ignoreCase = flags.some(flag => flag.includes("i"));
      const invert = flags.some(flag => flag.includes("v"));
      const needle = ignoreCase ? pattern.toLowerCase() : pattern;
      const matches = lines(content).filter(line => (ignoreCase ? line.toLowerCase() : line).includes(needle) !== invert);
      if (flags.some(flag => flag.includes("c"))) return success(state, command, String(matches.length));
      return success(state, command, matches.join("\n") || "(mos satr topilmadi)");
    }
    case "head":
    case "tail": {
      if (command === "tail" && flags.includes("-f")) return failure(state, command, "tail -f faylni jonli kuzatadi; bu haqiqiy serverda ishlaydi, simulyatorda yo‘q.");
      const countIndex = args.indexOf("-n");
      const count = countIndex >= 0 ? Math.min(50, Math.max(1, Number(args[countIndex + 1]) || 10)) : 10;
      const target = args.filter((arg, index) => !arg.startsWith("-") && index !== countIndex + 1).at(-1);
      const content = target ? requireFile(pathAt(target), state) : stdin;
      if (content === undefined) return failure(state, command, `Foydalanish: ${command} -n SON /virtual/fayl`);
      const rows = lines(content);
      return success(state, command, (command === "head" ? rows.slice(0, count) : rows.slice(-count)).join("\n"));
    }
    case "wc": {
      const target = operands.at(-1);
      const content = readSource(operands.length - 1 < 0 ? 0 : operands.length - 1);
      if (content === undefined) return failure(state, command, "Foydalanish: wc -l /virtual/fayl");
      const rows = lines(content);
      const suffix = target ? ` ${target}` : "";
      if (flags.includes("-l")) return success(state, command, `${rows.length}${suffix}`);
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      return success(state, command, `${rows.length} ${words} ${content.length}${suffix}`);
    }
    case "sort": {
      const content = readSource(0);
      if (content === undefined) return failure(state, command, "Foydalanish: sort [-n] [-r] /virtual/fayl");
      const numeric = flags.some(flag => flag.includes("n"));
      const reverse = flags.some(flag => flag.includes("r"));
      const sorted = lines(content).filter(Boolean).sort((a, b) => numeric ? (parseFloat(a) || 0) - (parseFloat(b) || 0) || a.localeCompare(b) : a.localeCompare(b));
      return success(state, command, (reverse ? sorted.reverse() : sorted).join("\n"));
    }
    case "uniq": {
      const content = readSource(0);
      if (content === undefined) return failure(state, command, "Foydalanish: uniq [-c] /virtual/fayl");
      const counts: { line: string; count: number }[] = [];
      for (const line of lines(content).filter(Boolean)) {
        const previous = counts.at(-1);
        if (previous?.line === line) previous.count += 1;
        else counts.push({ line, count: 1 });
      }
      return success(state, command, flags.includes("-c")
        ? counts.map(({ line, count }) => `${String(count).padStart(7)} ${line}`).join("\n")
        : counts.map(({ line }) => line).join("\n"));
    }
    case "cut": {
      const delimiterArg = args.find((arg) => arg.startsWith("-d"));
      const fieldArg = args.find((arg) => arg.startsWith("-f"));
      const delimiter = delimiterArg ? delimiterArg.slice(2) || args[args.indexOf(delimiterArg) + 1] : undefined;
      const fieldValue = fieldArg ? fieldArg.slice(2) || args[args.indexOf(fieldArg) + 1] : undefined;
      const consumed = new Set([delimiterArg, fieldArg, delimiterArg && delimiterArg.length === 2 ? args[args.indexOf(delimiterArg) + 1] : undefined, fieldArg && fieldArg.length === 2 ? args[args.indexOf(fieldArg) + 1] : undefined]);
      const target = args.filter(arg => !consumed.has(arg) && !arg.startsWith("-")).at(-1);
      const content = target ? requireFile(pathAt(target), state) : stdin;
      if (!delimiter || !fieldValue || content === undefined) return failure(state, command, "Foydalanish: cut -d: -f1 /virtual/fayl");
      const field = Number(fieldValue) - 1;
      if (!Number.isInteger(field) || field < 0) return failure(state, command, "Maydon raqami 1 yoki undan katta bo‘lsin.");
      return success(state, command, lines(content).filter(Boolean).map((line) => line.split(delimiter)[field] ?? "").join("\n"));
    }
    case "apt":
      if (args[0] !== "list" || args[1] !== "--installed") return failure(state, command, "O‘quv terminalida faqat `apt list --installed` ko‘rish buyrug‘i ishlaydi; paket o‘rnatish/o‘chirish yopiq.");
      return success(state, command, "Listing... Done\nbash/now 5.2.21-2 amd64 [installed]\ncoreutils/now 9.4-3 amd64 [installed]\nnginx/now 1.24.0-2 amd64 [installed]\nopenssh-server/now 1:9.6p1-3 amd64 [installed]\nsystemd/now 255.4-1 amd64 [installed]");
    case "man":
      return success(state, command, args[0] ? `${args[0]}(1) — o‘quv qo‘llanmasi\nBu terminalda qisqa tavsif ko‘rsatiladi. To‘liq tizim man-page’lari mavjud emas. Haqiqiy man’dan q bilan chiqiladi.` : "Foydalanish: man BUYRUQ");
    default:
      return failure(state, command, `‘${command}’ bu o‘quv terminalida mavjud emas. \`help\` yozib, ruxsat etilgan buyruqlarni ko‘ring. Hech qanday buyruq haqiqiy tizimga yuborilmaydi.`);
  }
}

/**
 * Runs one line typed into the course terminal against an in-memory file tree. Pipelines are limited to
 * text filters and redirection to the student's home; nothing ever reaches a real shell, disk or network.
 */
export function runLinuxVirtualCommand(input: string, originalState: LinuxVirtualTerminalState): LinuxVirtualCommandResult {
  const state = cloneState(originalState);
  const trimmed = input.trim();
  if (!trimmed) return failure(state, "", "Buyruq kiriting yoki `help` deb yozing.");
  if (trimmed.length > 240) return failure(state, "", "Buyruq 240 belgidan oshmasin.");
  state.history = [...(state.history ?? []), trimmed].slice(-50);
  if (/[\r\n;&<`$]/.test(trimmed)) {
    return failure(state, "", "Bu terminalda `;`, `&`, `<`, `$` va boshqa shell kengaytmalari o‘chirilgan. Pipeline (`|`) va `>`/`>>` cheklangan holda ishlaydi.");
  }
  const parsed = splitShell(trimmed);
  if (!parsed) return failure(state, "", "Pipeline yoki yo‘naltirish noto‘g‘ri yozilgan: `|` bo‘g‘inlari bo‘sh bo‘lmasin, `>` faqat oxirida bitta fayl bilan kelsin.");
  if (parsed.stages.length > 6) return failure(state, "", "Pipeline 6 bo‘g‘indan oshmasin.");

  let current = state;
  let output: string | undefined;
  let firstCommand = "";
  for (const [index, stage] of parsed.stages.entries()) {
    const name = tokenize(stage)[0]?.toLowerCase() ?? "";
    if (index === 0) firstCommand = name;
    else if (!filters.has(name)) return failure(state, firstCommand, `Pipeline’da faqat matn filtrlari ishlaydi: ${[...filters].join(", ")}. ‘${name}’ bu yerda ruxsat etilmagan.`);
    const result = runOne(stage, current, index === 0 ? undefined : output ?? "");
    if (!result.ok) return { ...result, state: index === 0 ? result.state : state };
    current = result.state;
    output = result.output;
  }

  if (parsed.redirect) {
    const path = resolvePath(current.cwd, parsed.redirect.target);
    if (!isHomePath(path)) return failure(state, firstCommand, "Natija faqat /home/student ichidagi faylga yozilishi mumkin.");
    if (isDirectory(path, current)) return failure(state, firstCommand, `${parsed.redirect.target}: bu katalog`);
    if (!isDirectory(parentOf(path), current)) return failure(state, firstCommand, "Fayl katalogi topilmadi.");
    const text = output ? `${output}\n` : "";
    current.files[path] = parsed.redirect.append ? `${current.files[path] ?? ""}${text}` : text;
    current.modes[path] ??= "644";
    return success(current, firstCommand, "");
  }
  return success(current, firstCommand, output ?? "");
}
