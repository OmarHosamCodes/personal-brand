export async function openAppWindow(url: string) {
  const chrome =
    findBin("google-chrome") ||
    findBin("google-chrome-stable") ||
    findBin("chromium-browser") ||
    findBin("chromium") ||
    findBin("brave-browser");

  if (chrome) {
    Bun.spawn(
      [
        chrome,
        `--app=${url}`,
        "--new-window",
        "--class=OmarHosamPost",
        "--name=Omar Hosam Post-Production",
        "--disable-extensions",
      ],
      { stdout: "ignore", stderr: "ignore", stdin: "ignore" },
    );
    return;
  }

  const xdg = findBin("xdg-open");
  if (xdg) {
    Bun.spawn([xdg, url], { stdout: "ignore", stderr: "ignore", stdin: "ignore" });
  }
}

function findBin(bin: string): string | null {
  const proc = Bun.spawnSync(["which", bin], { stdout: "pipe", stderr: "pipe" });
  if (proc.exitCode !== 0) return null;
  const path = new TextDecoder().decode(proc.stdout).trim();
  return path || null;
}
