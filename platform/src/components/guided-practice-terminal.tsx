"use client";

import { FormEvent, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { LearningInteractivePractice } from "@/lib/learning-demo";
import { getPracticeCommandCompletion } from "@/lib/practice-command-completion";

type Props = {
  practice: LearningInteractivePractice;
  completedTaskIds: string[];
  nickname: string;
  onTaskComplete: (taskId: string, allComplete: boolean) => void;
};

type TerminalLine = { command: string; output: string; failed: boolean };

function normalizeCommand(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function GuidedPracticeTerminal({ practice, completedTaskIds, nickname, onTaskComplete }: Props) {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const completed = new Set(completedTaskIds);
  const doneCount = practice.tasks.filter((task) => completed.has(task.id)).length;
  const label = practice.platform === "windows" ? "PowerShell (simulyatsiya)" : "Tarmoq CLI (simulyatsiya)";
  const prompt = practice.platform === "windows" ? "PS C:\\Lab>" : `${nickname}@network-lab:~$`;

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const commandText = input.trim();
    if (!commandText) return;

    if (normalizeCommand(commandText) === "help") {
      setLines((current) => [...current, {
        command: commandText,
        output: `Faqat ushbu darsdagi buyruqlar simulyatsiya qilinadi:\n${practice.tasks.map((task) => task.command).join("\n")}`,
        failed: false
      }].slice(-40));
      setInput("");
      return;
    }

    const task = practice.tasks.find((item) => normalizeCommand(item.command) === normalizeCommand(commandText));
    if (!task) {
      setLines((current) => [...current, {
        command: commandText,
        output: "Bu buyruq ushbu xavfsiz simulyatorda mavjud emas. Vazifa ro‘yxatidagi buyruqdan foydalaning.",
        failed: true
      }].slice(-40));
      setInput("");
      return;
    }

    let output = task.output.uz;
    if (!completed.has(task.id)) {
      const allComplete = doneCount + 1 === practice.tasks.length;
      output = [output, `✓ ${task.prompt.uz}`, allComplete ? "Barcha amaliy vazifalar bajarildi. Endi dars savoliga javob bering." : ""].filter(Boolean).join("\n");
      onTaskComplete(task.id, allComplete);
    }
    setLines((current) => [...current, { command: commandText, output: output || "(chiqish yo‘q)", failed: false }].slice(-40));
    setInput("");
  }

  function completeCommand(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Tab" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const completion = getPracticeCommandCompletion(
      event.currentTarget.value,
      practice.tasks.map((task) => task.command)
    );
    if (!completion) return;

    event.preventDefault();
    setInput(completion);
  }

  return (
    <section className="linux-terminal guided-practice-terminal" aria-label={label}>
      <div className="linux-terminal-header">
        <div>
          <strong>{label}</strong>
          <p>{practice.instructions.uz}</p>
        </div>
        <span className="linux-terminal-progress">{doneCount}/{practice.tasks.length} vazifa</span>
      </div>
      <div className="linux-terminal-safety">
        Bu haqiqiy PowerShell yoki tarmoq qurilmasi emas. Buyruqlar faqat oldindan berilgan sintetik natijalarni ko‘rsatadi; kompyuterga, serverga yoki internetga ulanmaydi.
      </div>
      <div className="linux-terminal-workspace">
        <div className="linux-terminal-console">
          <div className="linux-terminal-lights" aria-hidden="true"><i /><i /><i /></div>
          <div className="linux-terminal-output" ref={outputRef} aria-live="polite">
            <p className="linux-terminal-welcome">Tecsecure {practice.platform === "windows" ? "Windows" : "Network"} lab · {prompt}</p>
            <p className="linux-terminal-welcome">`help` yozib, ushbu darsdagi ruxsat etilgan buyruqlarni ko‘ring.</p>
            {lines.map((line, index) => (
              <div className="linux-terminal-entry" key={`${index}-${line.command}`}>
                <p><span className="linux-terminal-prompt">{prompt}</span> {line.command}</p>
                <pre className={line.failed ? "linux-terminal-error" : ""}>{line.output}</pre>
              </div>
            ))}
          </div>
          <form className="linux-terminal-input-row" onSubmit={run}>
            <div className="linux-terminal-prompt-row">
              <label className="linux-terminal-prompt" htmlFor="guided-practice-command">{prompt}</label>
              <span className="linux-terminal-tab-hint" id="guided-practice-tab-help">Buyruqni yozing · Tab bilan to‘ldiring</span>
            </div>
            <input
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              id="guided-practice-command"
              aria-label="Amaliy mashq buyrug‘i"
              aria-describedby="guided-practice-tab-help"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={completeCommand}
              placeholder="Vazifadagi buyruqni kiriting"
            />
          </form>
        </div>
        <div className="linux-terminal-tasks">
          <div className="linux-terminal-task-heading">
            <strong>Shu darsdagi mashqlar</strong>
            <span>{doneCount} / {practice.tasks.length}</span>
          </div>
          <ol>
            {practice.tasks.map((task) => {
              const isDone = completed.has(task.id);
              return (
                <li className={isDone ? "done" : ""} key={task.id}>
                  <div>
                    <span className="linux-terminal-task-status" aria-hidden="true">{isDone ? "✓" : "○"}</span>
                    <p>{task.prompt.uz}</p>
                      <span className="linux-terminal-task-command">
                        <span>Buyruq:</span>
                        <code>{task.command}</code>
                      </span>
                    </div>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
