"use client";

import { FormEvent, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { LinuxTerminalPractice } from "@/lib/learning-demo";
import { createLinuxVirtualTerminalState, runLinuxVirtualCommand } from "@/lib/linux-virtual-terminal";
import { getPracticeCommandCompletion } from "@/lib/practice-command-completion";

type Props = {
  practice: LinuxTerminalPractice;
  completedTaskIds: string[];
  nickname: string;
  onTaskComplete: (taskId: string, allComplete: boolean) => void;
};

type TerminalLine = { command: string; output: string; failed: boolean };

function normalizeCommand(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function LinuxVirtualTerminal({ practice, completedTaskIds, nickname, onTaskComplete }: Props) {
  const [terminal, setTerminal] = useState(createLinuxVirtualTerminalState);
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [input, setInput] = useState("");
  const outputRef = useRef<HTMLDivElement>(null);
  const completed = new Set(completedTaskIds);
  const doneCount = practice.tasks.filter((item) => completed.has(item.id)).length;
  const prompt = `${nickname}@linux:${terminal.cwd.replace("/home/student", "~")}$`;

  useEffect(() => {
    if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
  }, [lines]);

  function run(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const commandText = input.trim();
    if (!commandText) return;

    const result = runLinuxVirtualCommand(commandText, terminal);
    setTerminal(result.state);
    let output = result.output;
    let completedTask: string | undefined;
    if (result.ok) {
      const currentTask = practice.tasks.find((item) => normalizeCommand(item.command) === normalizeCommand(commandText));
      if (currentTask && !completed.has(currentTask.id)) {
        completedTask = currentTask.id;
        const nextDoneCount = doneCount + 1;
        const allComplete = nextDoneCount === practice.tasks.length;
        output = [output, `✓ ${currentTask.prompt.uz}`, allComplete ? "Barcha buyruq mashqlari bajarildi. Endi dars savoliga javob bering." : ""].filter(Boolean).join("\n");
        onTaskComplete(currentTask.id, allComplete);
      }
    }

    setLines((current) => [...current, { command: commandText, output: output || "(chiqish yo‘q)", failed: !result.ok }].slice(-40));
    setInput("");
  }

  function completeCommand(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key !== "Tab" || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) return;
    const completion = getPracticeCommandCompletion(
      event.currentTarget.value,
      practice.tasks.map((item) => item.command)
    );
    if (!completion) return;

    event.preventDefault();
    setInput(completion);
  }

  return (
    <section className="linux-terminal" aria-label="Linux virtual terminal">
      <div className="linux-terminal-header">
        <div>
          <strong>Virtual Linux terminali</strong>
          <p>{practice.instructions.uz}</p>
        </div>
        <span className="linux-terminal-progress">{doneCount}/{practice.tasks.length} buyruq</span>
      </div>

      <div className="linux-terminal-safety">
        Bu haqiqiy shell emas. Buyruqlar faqat brauzerdagi virtual fayllar va tayyor namunalar bilan ishlaydi; kompyuteringizga, serverga yoki internetga ulanmaydi.
      </div>

      <div className="linux-terminal-workspace">
        <div className="linux-terminal-console">
          <div className="linux-terminal-lights" aria-hidden="true"><i /><i /><i /></div>
          <div className="linux-terminal-output" ref={outputRef} aria-live="polite">
            <p className="linux-terminal-welcome">Tecsecure Linux lab · {nickname}@linux:~</p>
            <p className="linux-terminal-welcome">`help` yozib, simulyatorda mavjud buyruqlarni ko‘ring.</p>
            {lines.map((line, index) => (
              <div className="linux-terminal-entry" key={`${index}-${line.command}`}>
                <p><span className="linux-terminal-prompt">{prompt}</span> {line.command}</p>
                <pre className={line.failed ? "linux-terminal-error" : ""}>{line.output}</pre>
              </div>
            ))}
          </div>
          <form className="linux-terminal-input-row" onSubmit={run}>
            <div className="linux-terminal-prompt-row">
              <label className="linux-terminal-prompt" htmlFor="linux-terminal-command">{prompt}</label>
              <span className="linux-terminal-tab-hint" id="linux-terminal-tab-help">Buyruqni yozing · Tab bilan to‘ldiring</span>
            </div>
            <input
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              id="linux-terminal-command"
              aria-label="Linux buyruq satri"
              aria-describedby="linux-terminal-tab-help"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={completeCommand}
              placeholder="Buyruq kiriting — masalan: pwd"
            />
          </form>
        </div>

        <div className="linux-terminal-tasks">
          <div className="linux-terminal-task-heading">
            <strong>Shu darsdagi mashqlar</strong>
            <span>{doneCount} / {practice.tasks.length}</span>
          </div>
          <ol>
            {practice.tasks.map((item) => {
              const isDone = completed.has(item.id);
              return (
                <li className={isDone ? "done" : ""} key={item.id}>
                  <div>
                    <span className="linux-terminal-task-status" aria-hidden="true">{isDone ? "✓" : "○"}</span>
                    <p>{item.prompt.uz}</p>
                    <span className="linux-terminal-task-command">
                      <span>Buyruq:</span>
                      <code>{item.command}</code>
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
