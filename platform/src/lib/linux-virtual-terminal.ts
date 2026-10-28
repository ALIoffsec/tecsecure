export type LinuxVirtualTerminalState = {
  cwd: string;
  directories: string[];
  files: Record<string, string>;
  modes: Record<string, string>;
};

export type LinuxVirtualCommandResult = {
  state: LinuxVirtualTerminalState;
  output: string;
  command: string;
  ok: boolean;
};

const demoLog = [
  "2026-03-14T09:10:02Z INFO api-demo started",
  "2026-03-14T09:11:18Z WARN queue depth=72",
  "2026-03-14T09:12:41Z ERROR cache write failed",
  "2026-03-14T09:12:42Z ERROR request returned 503",
  "2026-03-14T09:13:01Z INFO worker recovered",
  "2026-03-14T09:14:11Z ERROR retry limit reached"
].join("\n");

export function createLinuxVirtualTerminalState(): LinuxVirtualTerminalState {
  return {
    cwd: "/home/student",
    directories: [
      "/", "/etc", "/home", "/home/student", "/home/student/Documents",
      "/home/student/.config", "/tmp", "/var", "/var/log"
    ],
    files: {
      "/etc/os-release": "NAME=\"Ubuntu\"\nVERSION=\"24.04 LTS (Noble Numbat)\"\nID=ubuntu\nPRETTY_NAME=\"Ubuntu 24.04 LTS\"\n",
      "/home/student/readme.txt": "Linux laboratoriyasiga xush kelibsiz.\nBuyruqlar faqat virtual muhitda bajariladi.\n",
      "/home/student/.profile": "EDITOR=nano\n",
      "/home/student/users.txt": "ali\nali\nbek\nnodir\n",
      "/home/student/passwd.txt": "root:x:0:0:root:/root:/bin/bash\nstudent:x:1000:1000:Student:/home/student:/bin/bash\n",
      "/var/log/demo.log": demoLog,
      "/var/log/auth-demo.log": "Mar 14 09:11:02 sshd: Accepted publickey for student\nMar 14 09:12:44 sshd: Failed password for invalid user demo\n"
    },
    modes: {
      "/home/student/readme.txt": "644",
      "/home/student/.profile": "600",
      "/home/student/users.txt": "644",
      "/home/student/passwd.txt": "644",
      "/home/student/lab/cleanup.tmp": "600",
      "/var/log/demo.log": "640",
      "/var/log/auth-demo.log": "640"
    }
  };
}

function cloneState(state: LinuxVirtualTerminalState): LinuxVirtualTerminalState {
  return {
    cwd: state.cwd,
    directories: [...state.directories],
    files: { ...state.files },
    modes: { ...state.modes }
  };
}

function resolvePath(cwd: string, value: string): string {
  const segments = (value.startsWith("/") ? value : `${cwd}/${value}`).split("/");
  const resolved: string[] = [];
  for (const segment of segments) {
    if (!segment || segment === ".") continue;
    if (segment === "..") resolved.pop();
    else resolved.push(segment);
  }
  return `/${resolved.join("/")}`;
}

function tokenize(input: string): string[] {
  const parts = input.match(/"[^"]*"|'[^']*'|\S+/g) ?? [];
  return parts.map((part) => {
    if ((part.startsWith('"') && part.endsWith('"')) || (part.startsWith("'") && part.endsWith("'"))) {
      return part.slice(1, -1);
    }
    return part;
  });
}

function isDirectory(path: string, state: LinuxVirtualTerminalState): boolean {
  return state.directories.includes(path);
}

function isFile(path: string, state: LinuxVirtualTerminalState): boolean {
  return Object.prototype.hasOwnProperty.call(state.files, path);
}

function isHomePath(path: string): boolean {
  return path === "/home/student" || path.startsWith("/home/student/");
}

function requireFile(path: string, state: LinuxVirtualTerminalState): string | undefined {
  return isFile(path, state) ? state.files[path] : undefined;
}

function basename(path: string): string {
  return path.split("/").filter(Boolean).at(-1) ?? "/";
}

function permissionText(mode: string): string {
  return mode.split("").map((digit) => {
    const value = Number(digit);
    return `${value & 4 ? "r" : "-"}${value & 2 ? "w" : "-"}${value & 1 ? "x" : "-"}`;
  }).join("");
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

function failure(state: LinuxVirtualTerminalState, command: string, output: string): LinuxVirtualCommandResult {
  return { state, output, command, ok: false };
}

function success(state: LinuxVirtualTerminalState, command: string, output: string): LinuxVirtualCommandResult {
  return { state, output, command, ok: true };
}

export function runLinuxVirtualCommand(input: string, originalState: LinuxVirtualTerminalState): LinuxVirtualCommandResult {
  const state = cloneState(originalState);
  const trimmed = input.trim();
  if (!trimmed) return failure(state, "", "Buyruq kiriting yoki `help` deb yozing.");
  if (trimmed.length > 240) return failure(state, "", "Buyruq 240 belgidan oshmasin.");
  if (/[\r\n|;&><`$]/.test(trimmed)) {
    return failure(state, "", "Bu terminal bitta oddiy buyruqni qabul qiladi. Pipeline, redirection va shell kengaytmalari o‘quv simulyatorida o‘chirilgan.");
  }

  const tokens = tokenize(trimmed);
  const command = tokens[0]?.toLowerCase() ?? "";
  const args = tokens.slice(1);
  const pathAt = (value: string) => resolvePath(state.cwd, value);

  switch (command) {
    case "help":
      return success(state, command, "Ruxsat etilgan o‘quv buyruqlari:\npwd ls cd find mkdir touch cat cp mv rm chmod stat\nuname whoami id ps top systemctl journalctl ip ping curl df free grep head tail wc sort uniq cut date apt man\n\nHaqiqiy shell, sudo, paket o‘rnatish, tarmoq so‘rovi va tizimni o‘zgartirish ishlamaydi.");
    case "pwd":
      return success(state, command, state.cwd);
    case "whoami":
      return success(state, command, "student");
    case "id":
      return success(state, command, "uid=1000(student) gid=1000(student) groups=1000(student)");
    case "uname":
      if (args.includes("-m")) return success(state, command, "x86_64");
      if (args.includes("-r")) return success(state, command, "6.8.0-virtual");
      return success(state, command, "Linux sandbox 6.8.0-virtual #1 SMP x86_64 GNU/Linux");
    case "date":
      return success(state, command, args.includes("-Is") ? "2026-03-14T09:15:00Z" : "Sat Mar 14 09:15:00 UTC 2026");
    case "ls": {
      const target = args.filter((arg) => !arg.startsWith("-")).at(-1) ?? ".";
      const path = pathAt(target);
      if (isFile(path, state)) {
        if (!args.some((arg) => arg.includes("l"))) return success(state, command, basename(path));
        const mode = state.modes[path] ?? "644";
        const size = state.files[path].length;
        return success(state, command, `-${permissionText(mode)} student student ${size} Mar 14 09:10 ${basename(path)}`);
      }
      if (!isDirectory(path, state)) return failure(state, command, `ls: '${target}': bunday yo‘l topilmadi`);
      const rows = listDirectory(path, state, args.some((arg) => arg.includes("a")));
      if (!args.some((arg) => arg.includes("l"))) return success(state, command, rows.join("  ") || "(bo‘sh katalog)");
      return success(state, command, rows.map((name) => {
        const childPath = path === "/" ? `/${name}` : `${path}/${name}`;
        const mode = state.modes[childPath] ?? (isDirectory(childPath, state) ? "755" : "644");
        const type = isDirectory(childPath, state) ? "d" : "-";
        return `${type}${permissionText(mode)} student student ${state.files[childPath]?.length ?? 4096} Mar 14 09:10 ${name}`;
      }).join("\n") || "total 0");
    }
    case "cd": {
      const target = args[0] ?? "/home/student";
      const path = pathAt(target);
      if (!isDirectory(path, state)) return failure(state, command, `cd: '${target}': katalog topilmadi`);
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
      const target = args.filter((arg) => !arg.startsWith("-")).at(-1);
      if (!target) return failure(state, command, "Foydalanish: mkdir [yo‘l]");
      const path = pathAt(target);
      if (!isHomePath(path)) return failure(state, command, "Faqat /home/student ichida virtual katalog yaratish mumkin.");
      const recursive = args.includes("-p");
      const parent = path.slice(0, path.lastIndexOf("/")) || "/";
      if (!isDirectory(parent, state) && !recursive) return failure(state, command, `mkdir: ota katalog yo‘q: ${parent}`);
      if (isDirectory(path, state)) return recursive ? success(state, command, "") : failure(state, command, `mkdir: katalog mavjud: ${path}`);
      if (recursive) {
        const parts = path.split("/").filter(Boolean);
        let current = "";
        for (const part of parts) {
          current += `/${part}`;
          if (!state.directories.includes(current)) state.directories.push(current);
        }
      } else {
        state.directories.push(path);
      }
      return success(state, command, "");
    }
    case "touch": {
      const target = args[0];
      if (!target) return failure(state, command, "Foydalanish: touch [fayl]");
      const path = pathAt(target);
      if (!isHomePath(path)) return failure(state, command, "Faqat /home/student ichida virtual fayl yaratish mumkin.");
      if (!isDirectory(path.slice(0, path.lastIndexOf("/")) || "/", state)) return failure(state, command, "Ota katalog avval yaratilishi kerak.");
      state.files[path] ??= "";
      state.modes[path] ??= "644";
      return success(state, command, "");
    }
    case "cat": {
      const path = args[0] ? pathAt(args[0]) : "";
      const content = requireFile(path, state);
      return content === undefined ? failure(state, command, `cat: '${args[0] ?? ""}': fayl topilmadi`) : success(state, command, content.trimEnd());
    }
    case "cp":
    case "mv": {
      const [sourceArg, targetArg] = args;
      if (!sourceArg || !targetArg) return failure(state, command, `Foydalanish: ${command} [manba] [manzil]`);
      const source = pathAt(sourceArg);
      let destination = pathAt(targetArg);
      const content = requireFile(source, state);
      if (content === undefined) return failure(state, command, `${command}: manba fayl topilmadi: ${sourceArg}`);
      if (isDirectory(destination, state)) destination = `${destination}/${basename(source)}`;
      if (!isHomePath(destination)) return failure(state, command, "Fayl faqat /home/student ichida nusxalanishi yoki ko‘chirilishi mumkin.");
      if (!isDirectory(destination.slice(0, destination.lastIndexOf("/")) || "/", state)) return failure(state, command, "Manzil katalogi topilmadi.");
      state.files[destination] = content;
      state.modes[destination] = state.modes[source] ?? "644";
      if (command === "mv") {
        delete state.files[source];
        delete state.modes[source];
      }
      return success(state, command, "");
    }
    case "rm": {
      const target = args.find((arg) => !arg.startsWith("-"));
      if (!target || args.some((arg) => arg === "-r" || arg === "-rf" || arg === "--recursive")) {
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
      if (!mode || !target || !/^[0-7]{3}$/.test(mode)) return failure(state, command, "Foydalanish: chmod 640 /home/student/file");
      const path = pathAt(target);
      if (!isHomePath(path) || !isFile(path, state)) return failure(state, command, "chmod faqat mavjud virtual o‘quvchi fayllariga qo‘llanadi.");
      state.modes[path] = mode;
      return success(state, command, "");
    }
    case "stat": {
      const target = args[0];
      const path = target ? pathAt(target) : "";
      const content = requireFile(path, state);
      if (content === undefined) return failure(state, command, `stat: '${target ?? ""}': virtual fayl topilmadi`);
      const mode = state.modes[path] ?? "644";
      return success(state, command, `  File: ${path}\n  Size: ${content.length}\tBlocks: 8\tIO Block: 4096 regular file\nAccess: (${mode}/-${permissionText(mode)})  Uid: (1000/student) Gid: (1000/student)`);
    }
    case "ps":
      return success(state, command, "USER       PID %CPU %MEM COMMAND\nroot         1  0.0  0.1 systemd\nstudent    412  0.1  0.4 bash\nstudent    591  0.0  0.1 python3 app.py");
    case "top":
      return success(state, command, "top - 09:15:00 up 2 days, 3 users, load average: 0.12, 0.08, 0.04\nTasks: 87 total, 1 running, 86 sleeping\n%Cpu(s): 2.0 us, 1.0 sy, 97.0 id\nMiB Mem: 4096.0 total, 2150.0 free\n  PID USER      %CPU COMMAND\n  412 student    0.1 bash");
    case "systemctl":
      if (args[0] !== "status") return failure(state, command, "Faqat o‘qish uchun `systemctl status <xizmat>` ruxsat etilgan.");
      return success(state, command, "● ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n     Active: active (running) since Sat 2026-03-14 08:00:00 UTC\n   Main PID: 315 (sshd)\n      Tasks: 1");
    case "journalctl":
      return success(state, command, "Mar 14 09:10:02 linux-demo sshd[315]: Server listening on 0.0.0.0 port 22\nMar 14 09:11:02 linux-demo sshd[422]: Accepted publickey for student from 192.0.2.10\nMar 14 09:12:44 linux-demo sshd[428]: Failed password for invalid user demo from 192.0.2.50\nMar 14 09:13:01 linux-demo sshd[315]: Connection closed by 192.0.2.50\nMar 14 09:14:11 linux-demo sshd[315]: Server ready");
    case "ip":
      if (args[0] === "route") return success(state, command, "default via 192.0.2.1 dev eth0\n192.0.2.0/24 dev eth0 proto kernel scope link src 192.0.2.25");
      if (args[0] === "addr" || args[0] === "address") return success(state, command, "1: lo: <LOOPBACK,UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500\n    inet 192.0.2.25/24 scope global eth0");
      return failure(state, command, "Foydalanish: ip addr yoki ip route");
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
      const [pattern, target] = args;
      const content = target ? requireFile(pathAt(target), state) : undefined;
      if (!pattern || content === undefined) return failure(state, command, "Foydalanish: grep MATN /virtual/fayl");
      const matches = content.split("\n").filter((line) => line.includes(pattern));
      return success(state, command, matches.join("\n") || "(mos satr topilmadi)");
    }
    case "head":
    case "tail": {
      const countIndex = args.indexOf("-n");
      const count = countIndex >= 0 ? Math.min(20, Math.max(1, Number(args[countIndex + 1]) || 10)) : 10;
      const target = args.filter((arg, index) => !arg.startsWith("-") && index !== countIndex + 1).at(-1);
      const content = target ? requireFile(pathAt(target), state) : undefined;
      if (content === undefined) return failure(state, command, `Foydalanish: ${command} -n SON /virtual/fayl`);
      const rows = content.split("\n").filter((line, index, all) => line || index < all.length - 1);
      return success(state, command, (command === "head" ? rows.slice(0, count) : rows.slice(-count)).join("\n"));
    }
    case "wc": {
      const target = args.at(-1);
      const content = target ? requireFile(pathAt(target), state) : undefined;
      if (content === undefined) return failure(state, command, "Foydalanish: wc -l /virtual/fayl");
      const lines = content.split("\n").filter((line, index, all) => line || index < all.length - 1);
      if (args.includes("-l")) return success(state, command, `${lines.length} ${target}`);
      const words = content.trim() ? content.trim().split(/\s+/).length : 0;
      return success(state, command, `${lines.length} ${words} ${content.length} ${target}`);
    }
    case "sort": {
      const target = args.at(-1);
      const content = target ? requireFile(pathAt(target), state) : undefined;
      if (content === undefined) return failure(state, command, "Foydalanish: sort /virtual/fayl");
      return success(state, command, content.split("\n").filter(Boolean).sort((a, b) => a.localeCompare(b)).join("\n"));
    }
    case "uniq": {
      const target = args.at(-1);
      const content = target ? requireFile(pathAt(target), state) : undefined;
      if (content === undefined) return failure(state, command, "Foydalanish: uniq [-c] /virtual/fayl");
      const rows = content.split("\n").filter(Boolean);
      const counts: { line: string; count: number }[] = [];
      for (const line of rows) {
        const previous = counts.at(-1);
        if (previous?.line === line) previous.count += 1;
        else counts.push({ line, count: 1 });
      }
      return success(state, command, args.includes("-c")
        ? counts.map(({ line, count }) => `${String(count).padStart(7)} ${line}`).join("\n")
        : counts.map(({ line }) => line).join("\n"));
    }
    case "cut": {
      const delimiterArg = args.find((arg) => arg.startsWith("-d"));
      const fieldArg = args.find((arg) => arg.startsWith("-f"));
      const delimiter = delimiterArg ? delimiterArg.slice(2) || args[args.indexOf(delimiterArg) + 1] : undefined;
      const fieldValue = fieldArg ? fieldArg.slice(2) || args[args.indexOf(fieldArg) + 1] : undefined;
      const target = args.at(-1);
      const content = target ? requireFile(pathAt(target), state) : undefined;
      if (!delimiter || !fieldValue || content === undefined) return failure(state, command, "Foydalanish: cut -d: -f1 /virtual/fayl");
      const field = Number(fieldValue) - 1;
      if (!Number.isInteger(field) || field < 0) return failure(state, command, "Maydon raqami 1 yoki undan katta bo‘lsin.");
      return success(state, command, content.split("\n").filter(Boolean).map((line) => line.split(delimiter)[field] ?? "").join("\n"));
    }
    case "apt":
      if (args[0] !== "list" || args[1] !== "--installed") return failure(state, command, "O‘quv terminalida faqat `apt list --installed` ko‘rish buyrug‘i ishlaydi; paket o‘rnatish/o‘chirish yopiq.");
      return success(state, command, "Listing... Done\nbash/now 5.2.21-2 amd64 [installed]\ncoreutils/now 9.4-3 amd64 [installed]\nsystemd/now 255.4-1 amd64 [installed]");
    case "man":
      return success(state, command, args[0] ? `${args[0]}(1) — o‘quv qo‘llanmasi\nBu terminalda qisqa tavsif ko‘rsatiladi. To‘liq tizim man-page’lari mavjud emas.` : "Foydalanish: man BUYRUQ");
    default:
      return failure(state, command, `‘${command}’ bu o‘quv terminalida mavjud emas. \`help\` yozib, ruxsat etilgan buyruqlarni ko‘ring. Hech qanday buyruq haqiqiy tizimga yuborilmaydi.`);
  }
}
