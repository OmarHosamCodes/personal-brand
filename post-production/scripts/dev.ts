const server = Bun.spawn(["bun", "run", "--cwd", "server", "dev"], {
  stdout: "inherit",
  stderr: "inherit",
  cwd: import.meta.dir + "/..",
});
const ui = Bun.spawn(["bun", "run", "--cwd", "ui", "dev"], {
  stdout: "inherit",
  stderr: "inherit",
  cwd: import.meta.dir + "/..",
});

const stop = () => {
  server.kill();
  ui.kill();
  process.exit(0);
};
process.on("SIGINT", stop);
process.on("SIGTERM", stop);

await Promise.race([server.exited, ui.exited]);
stop();
