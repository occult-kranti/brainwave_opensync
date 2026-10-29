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

describe("Atlas shell and visual tool boundary", () => {
  it("has no ambient renderer or scene controls while navigation preserves audio", async () => {
    await mount();
    expect(document.documentElement.dataset.design).toBe("listening-atlas");
    expect(document.documentElement.dataset.archiveTheme).toBeUndefined();
    expect(host.querySelector(".resonant-world")).toBeNull();
    expect(host.querySelector(".world-toolbar")).toBeNull();
    expect(host.querySelector("canvas")).toBeNull();
    await act(async () => { session.setCarrierHz(333); session.start(); });
    await act(async () => navigate("/studio"));
    expect(session.running).toBe(true);
    expect(session.carrierHz).toBe(333);
    expect(LiveEngine.prototype.start).toHaveBeenCalledTimes(1);
    expect(host.querySelector(".resonant-world")).toBeNull();
    await act(async () => root.unmount());
    expect(document.documentElement.dataset.design).toBeUndefined();
    await mount();
    expect(session.running).toBe(false);
    expect(document.documentElement.dataset.design).toBe("listening-atlas");
  });
  it("does not restore a rejected background from saved theme preferences", async () => {
    writeJson(STORAGE_KEYS.archiveTheme, 1, "quiet-horizon");
    await mount();
    expect(document.documentElement.dataset.archiveTheme).toBeUndefined();
    expect(document.documentElement.dataset.design).toBe("listening-atlas");
    expect(host.querySelector(".resonant-world")).toBeNull();
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
