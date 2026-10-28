function normalizeCommand(value: string) {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function getPracticeCommandCompletion(input: string, commands: readonly string[]) {
  const prefix = normalizeCommand(input);
  if (!prefix) return null;

  const matches = [...new Set(commands)].filter((command) => normalizeCommand(command).startsWith(prefix));
  if (!matches.length) return null;

  let commonPrefix = normalizeCommand(matches[0]);
  for (const command of matches.slice(1)) {
    const normalized = normalizeCommand(command);
    while (commonPrefix && !normalized.startsWith(commonPrefix)) {
      commonPrefix = commonPrefix.slice(0, -1);
    }
  }
  if (commonPrefix.length <= prefix.length) return null;

  return matches[0].slice(0, commonPrefix.length);
}
