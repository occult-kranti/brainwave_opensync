// @vitest-environment happy-dom
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MemoryRouter, useNavigate, type NavigateFunction } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AppShell } from "../layout/AppShell";
import { SessionProvider } from "../session/SessionContext";
import { useSession } from "../session/useSession";
import { LiveEngine } from "../audio/liveEngine";
import { STORAGE_KEYS, writeJson } from "@/lib/storage";
import { projectUrl } from "@/lib/assetUrl";
import { seedAdvisoryAck } from "@/test/helpers";

(globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
(Element.prototype as unknown as Record<string, unknown>).animate = undefined;
let root: Root;
let host: HTMLDivElement;
let session: ReturnType<typeof useSession>;
let navigate: NavigateFunction;
function Probe() {
  session = useSession();
  navigate = useNavigate();
  return null;
}
async function mount() {
  root = createRoot(host);
  await act(async () =>
    root.render(
      <MemoryRouter>
        <SessionProvider>
          <Probe />
          <AppShell>
            <p>Listening space</p>
          </AppShell>
        </SessionProvider>
      </MemoryRouter>,
    ),
  );
}
function themeButton(name: string) {
  return Array.from(host.querySelectorAll("button")).find(
    (button) => button.textContent === name,
  )!;
}
beforeEach(() => {
  window.localStorage.clear();
  seedAdvisoryAck();
  vi.spyOn(LiveEngine.prototype, "start").mockReturnValue(true);
  host = document.createElement("div");
  document.body.appendChild(host);
});
afterEach(async () => {
  if (root) await act(async () => root.unmount());
  host.remove();
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("Archive world themes", () => {
  it("switches scenes without restarting audio, retains the choice on navigation and reload", async () => {
    await mount();
    expect(themeButton("Night Country").getAttribute("aria-pressed")).toBe(
      "true",
    );
    await act(async () => {
      session.setCarrierHz(333);
      session.start();
    });
    const world = host.querySelector(".resonant-world");
    expect(world).not.toBeNull();
    await act(async () => themeButton("Quiet Horizon").click());
    expect(document.documentElement.dataset.archiveTheme).toBe("quiet-horizon");
    expect(host.querySelector(".resonant-world")).toBe(world);
    expect(session.running).toBe(true);
    expect(session.carrierHz).toBe(333);
    expect(LiveEngine.prototype.start).toHaveBeenCalledTimes(1);
    await act(async () => navigate("/studio"));
    expect(themeButton("Quiet Horizon").getAttribute("aria-pressed")).toBe(
      "true",
    );
    await act(async () => root.unmount());
    expect(document.documentElement.dataset.archiveTheme).toBeUndefined();
    await mount();
    expect(themeButton("Quiet Horizon").getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(session.running).toBe(false);
  });
  it("recovers from an unsupported saved theme", async () => {
    writeJson(STORAGE_KEYS.archiveTheme, 1, "unknown-theme");
    await mount();
    expect(themeButton("Night Country").getAttribute("aria-pressed")).toBe(
      "true",
    );
    expect(document.documentElement.dataset.archiveTheme).toBe("night-country");
    expect(host.querySelector(".resonant-world")).not.toBeNull();
  });
  it("keeps independent projects outside the archive path", () => {
    expect(projectUrl("previous/", "/brainwave_opensync/archive/")).toBe(
      "/brainwave_opensync/previous/",
    );
    expect(projectUrl("", "/brainwave_opensync/archive/")).toBe(
      "/brainwave_opensync/",
    );
    expect(projectUrl("previous/", "/")).toBe("/previous/");
  });
});
