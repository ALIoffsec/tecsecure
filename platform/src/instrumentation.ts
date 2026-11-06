/** Next calls this for every uncaught server error, so failures reach the team instead of only a log file. */
export async function onRequestError(error: unknown, request: { path: string; method: string }) {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { recordError } = await import("@/lib/error-events");
  await recordError("server", error, `${request.method} ${request.path.split("?")[0]}`);
}
